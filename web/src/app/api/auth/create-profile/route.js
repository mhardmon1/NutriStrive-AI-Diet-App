import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { birthday, gender } = body;

    if (!birthday || !gender) {
      return Response.json(
        { error: "Birthday and gender are required" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await sql`
      SELECT id FROM users WHERE email = ${session.user.email}
    `;

    if (existingUser) {
      return Response.json(
        { error: "User profile already exists" },
        { status: 400 }
      );
    }

    // Create new user profile
    const [newUser] = await sql`
      INSERT INTO users (email, name, date_of_birth, sex)
      VALUES (${session.user.email}, ${session.user.name || session.user.email.split('@')[0]}, ${birthday}, ${gender})
      RETURNING id, email, name, date_of_birth, sex
    `;

    return Response.json({ success: true, user: newUser });
  } catch (error) {
    console.error("Error creating user profile:", error);
    return Response.json(
      { error: "Failed to create user profile" },
      { status: 500 }
    );
  }
}