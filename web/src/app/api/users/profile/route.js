import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || 1; // Default to user 1 for demo

    const userResult = await sql`
      SELECT u.*, ut.target_calories, ut.target_protein, ut.target_carbs, ut.target_fat, ut.target_water_ml
      FROM users u
      LEFT JOIN user_targets ut ON u.id = ut.user_id AND ut.is_active = true
      WHERE u.id = ${userId}
    `;

    if (userResult.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(userResult[0]);
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return Response.json(
      { error: "Failed to fetch user profile" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      sex,
      date_of_birth,
      height_cm,
      weight_kg,
      sport,
      position,
      goals,
    } = body;

    if (!name || !sex) {
      return Response.json(
        { error: "Name and sex are required" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    let userId;

    if (existingUser) {
      // Update existing user
      await sql`
        UPDATE users 
        SET 
          name = ${name},
          sex = ${sex},
          date_of_birth = ${date_of_birth},
          height_cm = ${height_cm},
          weight_kg = ${weight_kg},
          sport = ${sport},
          position = ${position},
          goals = ${goals},
          updated_at = CURRENT_TIMESTAMP
        WHERE email = ${session.user.email}
      `;
      userId = existingUser.id;
    } else {
      // Create new user
      const [newUser] = await sql`
        INSERT INTO users (email, name, sex, date_of_birth, height_cm, weight_kg, sport, position, goals)
        VALUES (${session.user.email}, ${name}, ${sex}, ${date_of_birth}, ${height_cm}, ${weight_kg}, ${sport}, ${position}, ${goals})
        RETURNING id
      `;
      userId = newUser.id;
    }

    return Response.json({ success: true, userId });
  } catch (error) {
    console.error("Error saving user profile:", error);
    return Response.json({ error: "Failed to save profile" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      height_cm,
      weight_kg,
      sport,
      goals,
      target_calories,
      target_protein,
      target_carbs,
      target_fat,
      target_water_ml,
    } = body;

    if (!userId) {
      return Response.json({ error: "User ID is required" }, { status: 400 });
    }

    // Update user profile
    const userUpdate = await sql`
      UPDATE users 
      SET name = COALESCE(${name}, name),
          height_cm = COALESCE(${height_cm}, height_cm),
          weight_kg = COALESCE(${weight_kg}, weight_kg),
          sport = COALESCE(${sport}, sport),
          goals = COALESCE(${goals}, goals),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ${userId}
      RETURNING *
    `;

    // Update or create user targets if provided
    if (
      target_calories ||
      target_protein ||
      target_carbs ||
      target_fat ||
      target_water_ml
    ) {
      await sql`
        INSERT INTO user_targets (user_id, target_calories, target_protein, target_carbs, target_fat, target_water_ml)
        VALUES (${userId}, ${target_calories}, ${target_protein}, ${target_carbs}, ${target_fat}, ${target_water_ml})
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          target_calories = COALESCE(${target_calories}, user_targets.target_calories),
          target_protein = COALESCE(${target_protein}, user_targets.target_protein),
          target_carbs = COALESCE(${target_carbs}, user_targets.target_carbs),
          target_fat = COALESCE(${target_fat}, user_targets.target_fat),
          target_water_ml = COALESCE(${target_water_ml}, user_targets.target_water_ml),
          updated_at = CURRENT_TIMESTAMP
      `;
    }

    return Response.json(userUpdate[0]);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return Response.json(
      { error: "Failed to update user profile" },
      { status: 500 },
    );
  }
}
