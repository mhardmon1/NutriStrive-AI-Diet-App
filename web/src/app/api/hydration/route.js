import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user ID from email
    const [user] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const userId = user.id;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get hydration logs for the day
    const logs = await sql`
      SELECT amount_ml, logged_at
      FROM hydration_logs
      WHERE user_id = ${userId} AND log_date = ${date}
      ORDER BY logged_at DESC
    `;

    // Get total for the day
    const total = await sql`
      SELECT COALESCE(SUM(amount_ml), 0) as total_water_ml
      FROM hydration_logs
      WHERE user_id = ${userId} AND log_date = ${date}
    `;

    // Get user's water target
    const target = await sql`
      SELECT target_water_ml
      FROM user_targets
      WHERE user_id = ${userId} AND is_active = true
    `;

    return Response.json({
      logs: logs || [],
      total: total[0]?.total_water_ml || 0,
      target: target[0]?.target_water_ml || 2500,
      date
    });
  } catch (error) {
    console.error('Error fetching hydration data:', error);
    return Response.json({ error: 'Failed to fetch hydration data' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user ID from email
    const [user] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { amount_ml, date } = body;
    const userId = user.id;

    if (!amount_ml || amount_ml <= 0) {
      return Response.json({ error: 'Valid amount_ml is required' }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    const result = await sql`
      INSERT INTO hydration_logs (user_id, amount_ml, log_date)
      VALUES (${userId}, ${amount_ml}, ${logDate})
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error logging hydration:', error);
    return Response.json({ error: 'Failed to log hydration' }, { status: 500 });
  }
}