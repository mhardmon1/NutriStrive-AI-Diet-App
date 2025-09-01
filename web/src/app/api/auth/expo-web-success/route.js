import { getToken } from "@auth/core/jwt";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const [token, jwt] = await Promise.all([
    getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL.startsWith("https"),
      raw: true,
    }),
    getToken({
      req: request,
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.AUTH_URL.startsWith("https"),
    }),
  ]);

  if (!jwt) {
    return new Response(
      `
			<html>
				<body>
					<script>
						window.parent.postMessage({ type: 'AUTH_ERROR', error: 'Unauthorized' }, '*');
					</script>
				</body>
			</html>
			`,
      {
        status: 401,
        headers: {
          "Content-Type": "text/html",
        },
      },
    );
  }

  // Try to create user profile if it doesn't exist
  let profileCreated = false;
  try {
    // Check if user already exists in our database
    const [existingUser] = await sql`
			SELECT id FROM users WHERE email = ${jwt.email}
		`;

    if (!existingUser) {
      // User doesn't exist, create basic profile
      await sql`
				INSERT INTO users (email, name, date_of_birth, sex)
				VALUES (${jwt.email}, ${jwt.name || jwt.email.split("@")[0]}, NULL, NULL)
			`;
      profileCreated = true;
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
    // Continue with success even if profile creation fails
  }

  const message = {
    type: "AUTH_SUCCESS",
    jwt: token,
    user: {
      id: jwt.sub,
      email: jwt.email,
      name: jwt.name,
    },
    profileCreated,
  };

  return new Response(
    `
		<html>
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<style>
					body {
						font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
						margin: 0;
						padding: 20px;
						background: linear-gradient(135deg, #f0fdf4, #dbeafe, #faf5ff);
						min-height: 100vh;
						display: flex;
						align-items: center;
						justify-content: center;
					}
					.container {
						background: rgba(255, 255, 255, 0.8);
						backdrop-filter: blur(10px);
						border-radius: 16px;
						padding: 32px;
						text-align: center;
						box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
						border: 1px solid rgba(255, 255, 255, 0.2);
						max-width: 400px;
						width: 100%;
					}
					.logo {
						width: 80px;
						height: 80px;
						margin: 0 auto 24px;
					}
					h2 {
						color: #1f2937;
						font-size: 24px;
						font-weight: 700;
						margin-bottom: 16px;
					}
					p {
						color: #6b7280;
						font-size: 16px;
						margin-bottom: 32px;
						line-height: 1.5;
					}
					.button {
						display: block;
						width: 100%;
						padding: 12px 16px;
						border-radius: 12px;
						font-size: 16px;
						font-weight: 600;
						border: none;
						cursor: pointer;
						margin-bottom: 16px;
						transition: all 0.2s;
					}
					.button-primary {
						background: linear-gradient(135deg, #10b981, #2563eb);
						color: white;
					}
					.button-primary:hover {
						background: linear-gradient(135deg, #059669, #1d4ed8);
					}
					.button-secondary {
						background: #e5e7eb;
						color: #374151;
					}
					.button-secondary:hover {
						background: #d1d5db;
					}
					.hidden {
						display: none;
					}
				</style>
			</head>
			<body>
				<div class="container">
					<div id="loading-screen">
						<div class="logo">
							<img src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/" alt="MOBA Logo" style="width: 100%; height: 100%; object-fit: contain;">
						</div>
						<h2>Welcome Back!</h2>
						<p>Setting up your account...</p>
					</div>

					<div id="faceid-screen" class="hidden">
						<div class="logo">
							<img src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/" alt="MOBA Logo" style="width: 100%; height: 100%; object-fit: contain;">
						</div>
						<h2>Enable Face ID?</h2>
						<p>Would you like to use Face ID for faster sign-ins next time?</p>
						<button class="button button-primary" onclick="handleFaceIdSetup(true)">
							Yes, Enable Face ID
						</button>
						<button class="button button-secondary" onclick="handleFaceIdSetup(false)">
							Not Now
						</button>
					</div>
				</div>

				<script>
					let isInWebView = false;
					let userEmail = '${jwt.email}';

					// Check if we're in a WebView (mobile app)
					try {
						isInWebView = window.parent !== window;
					} catch (e) {
						isInWebView = false;
					}

					// Try to get pending profile data from sessionStorage and update profile
					let pendingProfile = null;
					try {
						const pendingData = sessionStorage.getItem('pendingProfile');
						if (pendingData) {
							pendingProfile = JSON.parse(pendingData);
							sessionStorage.removeItem('pendingProfile');
						}
					} catch (e) {
						console.log('No pending profile data');
					}

					// Function to handle Face ID setup
					function handleFaceIdSetup(enable) {
						if (enable && isInWebView) {
							// Store Face ID preference for mobile
							window.parent.postMessage({ 
								type: 'ENABLE_FACE_ID', 
								email: userEmail 
							}, '*');
						}
						
						// Send success message
						if (isInWebView) {
							window.parent.postMessage(${JSON.stringify(message)}, '*');
						} else {
							window.location.href = '/';
						}
					}

					// Function to complete authentication
					function completeAuth() {
						if (isInWebView) {
							// For mobile, show Face ID prompt
							document.getElementById('loading-screen').classList.add('hidden');
							document.getElementById('faceid-screen').classList.remove('hidden');
						} else {
							// For web, redirect directly
							window.location.href = '/';
						}
					}

					// Handle profile creation if we have pending data
					if (pendingProfile && pendingProfile.birthday && pendingProfile.gender) {
						fetch('/api/users/profile', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								name: '${jwt.name || jwt.email.split("@")[0]}',
								sex: pendingProfile.gender,
								date_of_birth: pendingProfile.birthday,
							}),
						}).then(() => {
							setTimeout(completeAuth, 1000);
						}).catch(() => {
							// Still complete auth even if profile update fails
							setTimeout(completeAuth, 1000);
						});
					} else {
						// No pending profile data, complete auth immediately
						setTimeout(completeAuth, 1000);
					}
				</script>
			</body>
		</html>
		`,
    {
      headers: {
        "Content-Type": "text/html",
      },
    },
  );
}
