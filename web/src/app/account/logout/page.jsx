import useAuth from "@/utils/useAuth";

function MainComponent() {
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-sm p-8 shadow-2xl border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">🏋️</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sign Out</h1>
          <p className="text-gray-600">Thanks for using MOBA Nutrition</p>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-3 rounded-xl text-base font-semibold transition-all hover:from-green-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500/50"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default MainComponent;