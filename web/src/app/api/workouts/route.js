import sql from '@/app/api/utils/sql';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 1; // Default to user 1 for demo
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const workouts = await sql`
      SELECT id, name, workout_type, duration_minutes, calories_burned, 
             intensity_level, notes, workout_date, completed, created_at
      FROM workouts
      WHERE user_id = ${userId} AND workout_date = ${date}
      ORDER BY created_at
    `;

    return Response.json(workouts || []);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return Response.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      userId = 1, 
      name, 
      workout_type, 
      duration_minutes, 
      calories_burned, 
      intensity_level, 
      notes, 
      workout_date 
    } = body;

    if (!name || !workout_type) {
      return Response.json({ error: 'Name and workout type are required' }, { status: 400 });
    }

    const workoutDate = workout_date || new Date().toISOString().split('T')[0];

    const result = await sql`
      INSERT INTO workouts (
        user_id, name, workout_type, duration_minutes, calories_burned, 
        intensity_level, notes, workout_date
      )
      VALUES (
        ${userId}, ${name}, ${workout_type}, ${duration_minutes}, ${calories_burned},
        ${intensity_level}, ${notes}, ${workoutDate}
      )
      RETURNING *
    `;

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error creating workout:', error);
    return Response.json({ error: 'Failed to create workout' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      id, 
      userId = 1, 
      name, 
      workout_type, 
      duration_minutes, 
      calories_burned, 
      intensity_level, 
      notes, 
      completed 
    } = body;

    if (!id) {
      return Response.json({ error: 'Workout ID is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE workouts 
      SET name = COALESCE(${name}, name),
          workout_type = COALESCE(${workout_type}, workout_type),
          duration_minutes = COALESCE(${duration_minutes}, duration_minutes),
          calories_burned = COALESCE(${calories_burned}, calories_burned),
          intensity_level = COALESCE(${intensity_level}, intensity_level),
          notes = COALESCE(${notes}, notes),
          completed = COALESCE(${completed}, completed)
      WHERE id = ${id} AND user_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return Response.json({ error: 'Workout not found' }, { status: 404 });
    }

    return Response.json(result[0]);
  } catch (error) {
    console.error('Error updating workout:', error);
    return Response.json({ error: 'Failed to update workout' }, { status: 500 });
  }
}