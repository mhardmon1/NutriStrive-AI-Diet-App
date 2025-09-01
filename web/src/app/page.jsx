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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6">
            <img
              src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
              alt="MOBA Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome back, {user.name}!
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ready to optimize your nutrition and performance?
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Log Meals</h3>
              <p className="text-gray-600 mb-4">Track your daily nutrition intake</p>
              <button className="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
                Add Meal
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics</h3>
              <p className="text-gray-600 mb-4">View your nutrition trends</p>
              <button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                View Stats
              </button>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Profile</h3>
              <p className="text-gray-600 mb-4">Manage your account settings</p>
              <button className="w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <a
            href="/account/logout"
            className="inline-block text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}

export default MainComponent;