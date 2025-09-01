import sql from '@/app/api/utils/sql';

export async function POST(request) {
  try {
    const body = await request.json();
    const { meal_foods, user_goals, training_state = 'rest' } = body;

    if (!meal_foods || !Array.isArray(meal_foods) || meal_foods.length === 0) {
      return Response.json({ error: 'meal_foods array is required' }, { status: 400 });
    }

    // Get user profile and targets for context
    const userId = 1; // Default for demo
    const userProfile = await sql`
      SELECT u.sport, u.goals, ut.target_calories, ut.target_protein, ut.target_carbs, ut.target_fat
      FROM users u
      LEFT JOIN user_targets ut ON u.id = ut.user_id AND ut.is_active = true
      WHERE u.id = ${userId}
    `;

    const mealDescription = meal_foods.map(food => 
      `${food.name} (${food.quantity_grams}g, ${food.preparation_method || 'as prepared'})`
    ).join(', ');

    const currentMealNutrition = meal_foods.reduce((totals, food) => {
      const multiplier = food.quantity_grams / 100;
      return {
        calories: totals.calories + (food.calories_per_100g * multiplier),
        protein: totals.protein + (food.protein_per_100g * multiplier),
        carbs: totals.carbs + (food.carbs_per_100g * multiplier),
        fat: totals.fat + (food.fat_per_100g * multiplier)
      };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const messages = [
      {
        role: "system",
        content: `You are an expert sports nutritionist and meal optimization specialist. Analyze meals and suggest healthier alternatives based on the user's sport, goals, and current training state. Consider macro/micronutrient balance, food quality, timing, and specific athletic performance needs.`
      },
      {
        role: "user",
        content: `
Current meal: ${mealDescription}

User profile:
- Sport: ${userProfile[0]?.sport || 'General fitness'}
- Goals: ${userProfile[0]?.goals || 'General health'}
- Training state: ${training_state}
- Daily targets: ${userProfile[0]?.target_calories || 2500} calories, ${userProfile[0]?.target_protein || 150}g protein, ${userProfile[0]?.target_carbs || 300}g carbs, ${userProfile[0]?.target_fat || 83}g fat

Current meal nutrition:
- Calories: ${Math.round(currentMealNutrition.calories)}
- Protein: ${Math.round(currentMealNutrition.protein)}g
- Carbs: ${Math.round(currentMealNutrition.carbs)}g  
- Fat: ${Math.round(currentMealNutrition.fat)}g

Please analyze this meal and provide optimization recommendations.`
      }
    ];

    const response = await fetch('/integrations/anthropic-claude-sonnet-3-5/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        json_schema: {
          name: "meal_optimization",
          schema: {
            type: "object",
            properties: {
              current_meal_analysis: {
                type: "object",
                properties: {
                  overall_score: { type: "number" },
                  strengths: {
                    type: "array",
                    items: { type: "string" }
                  },
                  weaknesses: {
                    type: "array", 
                    items: { type: "string" }
                  },
                  suitability_for_goals: { type: "string" },
                  timing_appropriateness: { type: "string" }
                },
                required: ["overall_score", "strengths", "weaknesses", "suitability_for_goals", "timing_appropriateness"],
                additionalProperties: false
              },
              optimized_meal: {
                type: "object",
                properties: {
                  foods: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        quantity_grams: { type: "number" },
                        preparation_method: { type: "string" },
                        replacement_reason: { type: "string" },
                        is_replacement: { type: "boolean" },
                        original_food: { type: ["string", "null"] }
                      },
                      required: ["name", "quantity_grams", "preparation_method", "replacement_reason", "is_replacement", "original_food"],
                      additionalProperties: false
                    }
                  },
                  estimated_nutrition: {
                    type: "object",
                    properties: {
                      calories: { type: "number" },
                      protein: { type: "number" },
                      carbs: { type: "number" },
                      fat: { type: "number" },
                      fiber: { type: "number" },
                      sugar: { type: "number" },
                      sodium: { type: "number" }
                    },
                    required: ["calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium"],
                    additionalProperties: false
                  },
                  improvement_score: { type: "number" }
                },
                required: ["foods", "estimated_nutrition", "improvement_score"],
                additionalProperties: false
              },
              key_improvements: {
                type: "array",
                items: { type: "string" }
              },
              rationale: { type: "string" },
              performance_benefits: {
                type: "array",
                items: { type: "string" }
              },
              additional_recommendations: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["current_meal_analysis", "optimized_meal", "key_improvements", "rationale", "performance_benefits", "additional_recommendations"],
            additionalProperties: false
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Meal optimization failed: ${response.statusText}`);
    }

    const result = await response.json();
    const optimizationData = JSON.parse(result.choices[0].message.content);

    return Response.json(optimizationData);
  } catch (error) {
    console.error('Error optimizing meal:', error);
    return Response.json({ error: 'Failed to optimize meal' }, { status: 500 });
  }
}