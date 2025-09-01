import { useEffect, useState } from "react";
import useUser from "@/utils/useUser";

function MainComponent() {
  const { data: user, loading, refetch } = useUser();
  const [profileCreating, setProfileCreating] = useState(false);

  useEffect(() => {
    // Handle profile creation for new signups
    const handleProfileCreation = async () => {
      if (!user || profileCreating) return;

      // Check if we have pending profile data from signup
      try {
        const pendingData = sessionStorage.getItem('pendingProfile');
        if (pendingData) {
          const profileData = JSON.parse(pendingData);
          setProfileCreating(true);
          
          // Create/update user profile with signup data
          try {
            const response = await fetch('/api/users/profile', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: user.name || user.email.split('@')[0],
                sex: profileData.gender,
                date_of_birth: profileData.birthday,
              }),
            });

            if (response.ok) {
              sessionStorage.removeItem('pendingProfile');
              // Refresh user data
              refetch();
            }
          } catch (error) {
            console.error('Failed to update profile:', error);
          } finally {
            setProfileCreating(false);
          }
        }
      } catch (error) {
        console.error('Error processing pending profile:', error);
      }
    };

    handleProfileCreation();
  }, [user, profileCreating, refetch]);

  if (loading || profileCreating) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <img
              src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
              alt="MOBA Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {profileCreating ? "Setting up your profile..." : "Loading..."}
          </h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-2xl border border-white/20 text-center">
          <div className="w-20 h-20 mx-auto mb-6">
            <img
              src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
              alt="MOBA Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to MOBA</h1>
          <p className="text-gray-600 mb-8">
            Your performance nutrition platform
          </p>
          <div className="space-y-4">
            <a
              href="/account/signin"
              className="block w-full bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 rounded-xl text-base font-semibold transition-all hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              Sign In
            </a>
            <a
              href="/account/signup"
              className="block w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-base font-semibold transition-all hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
            >
              Create Account
            </a>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated, show main app interface
  return (
    <div>
      {/* Redirect to dashboard for authenticated users */}
      {typeof window !== 'undefined' && (window.location.href = '/dashboard')}
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;