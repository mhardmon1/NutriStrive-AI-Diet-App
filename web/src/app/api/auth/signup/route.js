import { signUp } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, birthday, gender } = body;

    if (!email || !password || !birthday || !gender) {
      return Response.json(
        { error: "Email, password, birthday, and gender are required" },
        { status: 400 }
      );
    }

    // Create auth user first
    const authResult = await signUp({
      email,
      password,
    });

    if (authResult.error) {
      return Response.json({ error: authResult.error }, { status: 400 });
    }

    // Create user profile in our database
    try {
      await sql`
        INSERT INTO users (email, name, date_of_birth, sex)
        VALUES (${email}, ${email.split('@')[0]}, ${birthday}, ${gender})
      `;
    } catch (dbError) {
      console.error("Error creating user profile:", dbError);
      // Continue with auth success even if profile creation fails
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Signup error:", error);
    return Response.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}