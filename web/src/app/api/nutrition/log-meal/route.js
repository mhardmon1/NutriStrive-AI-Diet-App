import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

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
    const { meal_type, foods, date } = body;
    const userId = user.id;

    if (!userId || !meal_type || !foods || foods.length === 0) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Calculate totals
    const totalCalories = foods.reduce(
      (sum, food) => sum + (food.calories || 0),
      0,
    );
    const totalProtein = foods.reduce(
      (sum, food) => sum + (food.protein || 0),
      0,
    );
    const totalCarbs = foods.reduce((sum, food) => sum + (food.carbs || 0), 0);
    const totalFat = foods.reduce((sum, food) => sum + (food.fat || 0), 0);

    // Create meal
    const mealResult = await sql`
      INSERT INTO meals (user_id, meal_type, name, total_calories, total_protein, total_carbs, total_fat, meal_date)
      VALUES (${userId}, ${meal_type}, ${meal_type + " meal"}, ${totalCalories}, ${totalProtein}, ${totalCarbs}, ${totalFat}, ${date})
      RETURNING id
    `;

    const mealId = mealResult[0].id;

    // Insert foods into database and link to meal
    for (const food of foods) {
      let foodId;

      // First, try to find existing food by name
      const existingFood = await sql`
        SELECT id FROM foods WHERE name = ${food.name} LIMIT 1
      `;

      if (existingFood.length > 0) {
        foodId = existingFood[0].id;
      } else {
        // Insert new food if it doesn't exist
        const foodResult = await sql`
          INSERT INTO foods (name, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, category)
          VALUES (
            ${food.name},
            ${food.calories_per_100g || (food.calories / (food.estimated_portion_grams || 100)) * 100},
            ${food.protein_per_100g || (food.protein / (food.estimated_portion_grams || 100)) * 100},
            ${food.carbs_per_100g || (food.carbs / (food.estimated_portion_grams || 100)) * 100},
            ${food.fat_per_100g || (food.fat / (food.estimated_portion_grams || 100)) * 100},
            ${food.category || "general"}
          )
          RETURNING id
        `;
        foodId = foodResult[0].id;
      }

      // Link food to meal
      await sql`
        INSERT INTO meal_foods (meal_id, food_id, quantity_grams, preparation_method)
        VALUES (
          ${mealId},
          ${foodId},
          ${food.estimated_portion_grams || food.quantity_grams || 100},
          ${food.preparation_method || null}
        )
      `;
    }

    return Response.json({
      success: true,
      mealId,
      message: "Meal logged successfully",
    });
  } catch (error) {
    console.error("Error logging meal:", error);
    return Response.json(
      { error: "Failed to log meal", details: error.message },
      { status: 500 },
    );
  }
}
