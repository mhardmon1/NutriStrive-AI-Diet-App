import sql from '@/app/api/utils/sql';
import { auth } from '@/auth';

// Calculate BMR using Mifflin-St Jeor Equation
function calculateBMR(weight_kg, height_cm, sex, age = 25) {
  if (sex === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  } else {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
  }
}

// Calculate TDEE based on activity level
function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    low: 1.2,      // Sedentary
    moderate: 1.55, // Moderate exercise
    high: 1.725,   // Heavy exercise
    athlete: 1.9   // Very heavy exercise/athlete
  };
  
  return bmr * (multipliers[activityLevel] || multipliers.moderate);
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { weight_kg, height_cm, sex, activity_level = 'moderate', age = 25 } = body;

    if (!weight_kg || !height_cm || !sex) {
      return Response.json({ 
        error: 'Weight, height, and sex are required' 
      }, { status: 400 });
    }

    // Get user ID from email
    const [user] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate nutrition targets
    const bmr = calculateBMR(weight_kg, height_cm, sex, age);
    const tdee = calculateTDEE(bmr, activity_level);
    
    // Target calories (TDEE + 10% for athletes)
    const target_calories = Math.round(tdee * 1.1);
    
    // Protein: 1.6-2.2g per kg body weight for athletes
    const target_protein = Math.round(weight_kg * 2.0);
    
    // Fat: 25-30% of total calories
    const target_fat = Math.round((target_calories * 0.275) / 9);
    
    // Carbs: remaining calories
    const remaining_calories = target_calories - (target_protein * 4) - (target_fat * 9);
    const target_carbs = Math.round(remaining_calories / 4);
    
    // Water: 35ml per kg body weight + extra for athletes
    const target_water_ml = Math.round(weight_kg * 40);

    // Deactivate old targets
    await sql`
      UPDATE user_targets 
      SET is_active = false 
      WHERE user_id = ${user.id}
    `;

    // Insert new targets
    const [newTargets] = await sql`
      INSERT INTO user_targets (
        user_id, target_calories, target_protein, target_carbs, 
        target_fat, target_water_ml, is_active
      )
      VALUES (
        ${user.id}, ${target_calories}, ${target_protein}, ${target_carbs},
        ${target_fat}, ${target_water_ml}, true
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      targets: newTargets,
      calculations: {
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        activity_level
      }
    });
  } catch (error) {
    console.error('Error creating nutrition targets:', error);
    return Response.json({ error: 'Failed to create targets' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user targets
    const [user] = await sql`
      SELECT u.id, ut.*
      FROM users u
      LEFT JOIN user_targets ut ON u.id = ut.user_id AND ut.is_active = true
      WHERE u.email = ${session.user.email}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error('Error fetching nutrition targets:', error);
    return Response.json({ error: 'Failed to fetch targets' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { target_calories, target_protein, target_carbs, target_fat, target_water_ml } = body;

    // Get user ID
    const [user] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    // Update targets
    const [updatedTargets] = await sql`
      UPDATE user_targets 
      SET 
        target_calories = COALESCE(${target_calories}, target_calories),
        target_protein = COALESCE(${target_protein}, target_protein),
        target_carbs = COALESCE(${target_carbs}, target_carbs),
        target_fat = COALESCE(${target_fat}, target_fat),
        target_water_ml = COALESCE(${target_water_ml}, target_water_ml),
        updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${user.id} AND is_active = true
      RETURNING *
    `;

    return Response.json({ success: true, targets: updatedTargets });
  } catch (error) {
    console.error('Error updating nutrition targets:', error);
    return Response.json({ error: 'Failed to update targets' }, { status: 500 });
  }
}