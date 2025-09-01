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

    // Get user targets
    const targets = await sql`
      SELECT target_calories, target_protein, target_carbs, target_fat, target_water_ml
      FROM user_targets
      WHERE user_id = ${userId} AND is_active = true
    `;

    // Get daily totals from meals
    const dailyTotals = await sql`
      SELECT 
        COALESCE(SUM(total_calories), 0) as total_calories,
        COALESCE(SUM(total_protein), 0) as total_protein,
        COALESCE(SUM(total_carbs), 0) as total_carbs,
        COALESCE(SUM(total_fat), 0) as total_fat
      FROM meals
      WHERE user_id = ${userId} AND meal_date = ${date}
    `;

    // Get hydration total
    const hydration = await sql`
      SELECT COALESCE(SUM(amount_ml), 0) as total_water_ml
      FROM hydration_logs
      WHERE user_id = ${userId} AND log_date = ${date}
    `;

    // Get diet score for the day
    const dietScore = await sql`
      SELECT overall_score, macro_balance_score, micronutrient_score, 
             meal_timing_score, food_quality_score, food_diversity_score
      FROM diet_scores
      WHERE user_id = ${userId} AND score_date = ${date}
    `;

    // Get meals for the day
    const meals = await sql`
      SELECT m.*, 
        ARRAY_AGG(
          JSON_BUILD_OBJECT(
            'food_name', f.name,
            'food_brand', f.brand,
            'quantity_grams', mf.quantity_grams,
            'preparation_method', mf.preparation_method,
            'calories_per_100g', f.calories_per_100g,
            'protein_per_100g', f.protein_per_100g,
            'image_url', f.image_url
          )
        ) as foods
      FROM meals m
      LEFT JOIN meal_foods mf ON m.id = mf.meal_id
      LEFT JOIN foods f ON mf.food_id = f.id
      WHERE m.user_id = ${userId} AND m.meal_date = ${date}
      GROUP BY m.id, m.meal_type, m.name, m.total_calories, m.total_protein, m.total_carbs, m.total_fat, m.meal_date, m.logged_at
      ORDER BY m.logged_at
    `;

    const response = {
      date,
      targets: targets[0] || {},
      totals: dailyTotals[0] || {},
      hydration: hydration[0] || { total_water_ml: 0 },
      dietScore: dietScore[0] || null,
      meals: meals || []
    };

    return Response.json(response);
  } catch (error) {
    console.error('Error fetching daily nutrition summary:', error);
    return Response.json({ error: 'Failed to fetch daily nutrition summary' }, { status: 500 });
  }
}