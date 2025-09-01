import { useState } from "react";
import useAuth from "@/utils/useAuth";

function MainComponent() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setLoading(false);
        setError("Sign in is taking too long. Please try again.");
      }, 10000); // 10 second timeout

      const result = await signInWithCredentials({
        email,
        password,
        callbackUrl: "/",
        redirect: false, // Don't auto-redirect, handle manually
      });

      clearTimeout(timeoutId);

      if (result?.error) {
        throw new Error(result.error);
      }

      // If successful, manually redirect
      if (result?.ok) {
        window.location.href = "/";
      } else {
        throw new Error("Sign in failed");
      }
    } catch (err) {
      setLoading(false);
      const errorMessages = {
        OAuthSignin:
          "Couldn't start sign-in. Please try again or use a different method.",
        OAuthCallback: "Sign-in failed after redirecting. Please try again.",
        OAuthCreateAccount:
          "Couldn't create an account with this sign-in method. Try another option.",
        EmailCreateAccount:
          "This email can't be used to create an account. It may already exist.",
        Callback: "Something went wrong during sign-in. Please try again.",
        OAuthAccountNotLinked:
          "This account is linked to a different sign-in method. Try using that instead.",
        CredentialsSignin:
          "Incorrect email or password. Try again or reset your password.",
        AccessDenied: "You don't have permission to sign in.",
        Configuration:
          "Sign-in isn't working right now. Please try again later.",
        Verification: "Your sign-in link has expired. Request a new one.",
      };

      setError(
        errorMessages[err.message] || "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <form
        noValidate
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-2xl border border-white/20"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4">
            <img
              src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
              alt="MOBA Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome Back to MOBA
          </h1>
          <p className="text-gray-600">
            Sign in to continue your nutrition journey
          </p>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <input
                required
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                required
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-lg outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all disabled:opacity-50"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 rounded-xl text-base font-semibold transition-all hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>

          <div className="text-center">
            <a
              href="#"
              className={`text-sm text-green-600 hover:text-green-700 font-medium ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
              Forgot your password?
            </a>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a
              href={`/account/signup${
                typeof window !== "undefined" ? window.location.search : ""
              }`}
              className={`text-green-600 hover:text-green-700 font-semibold transition-colors ${loading ? "pointer-events-none opacity-50" : ""}`}
            >
              Sign up
            </a>
          </p>
        </div>
      </form>
    </div>
  );
}

export default MainComponent;
