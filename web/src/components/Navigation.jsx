import { useState } from "react";
import { useLocation } from "react-router";
import useUser from "@/utils/useUser";
import { Button } from "@/client-integrations/shadcn-ui";
import { 
  Home, 
  Utensils, 
  Activity, 
  Droplet, 
  User,
  Menu,
  X
} from "lucide-react";

function Navigation() {
  const { data: user } = useUser();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Nutrition', href: '/nutrition', icon: Utensils },
    { name: 'Workouts', href: '/workouts', icon: Activity },
    { name: 'Hydration', href: '/hydration', icon: Droplet },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <img
                  src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
                  alt="MOBA Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-800">MOBA</span>
            </div>

            {/* Navigation Links */}
            <div className="flex items-center space-x-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </a>
                );
              })}
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Welcome, {user.name}</span>
              <Button variant="outline" size="sm">
                <a href="/account/logout">Sign Out</a>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8">
                <img
                  src="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
                  alt="MOBA Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-800">MOBA</span>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="pb-4 border-t border-gray-200">
              <div className="space-y-1 pt-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4 mr-3" />
                      {item.name}
                    </a>
                  );
                })}
                <div className="pt-2 mt-2 border-t border-gray-200">
                  <a
                    href="/account/logout"
                    className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign Out
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

export default Navigation;