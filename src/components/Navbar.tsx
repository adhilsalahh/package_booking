import { Menu, X, User, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface NavbarProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const navItems = user
    ? isAdmin
      ? [
          { name: 'Dashboard', value: 'admin-dashboard' },
          { name: 'Packages', value: 'admin-packages' },
          { name: 'Bookings', value: 'admin-bookings' },
          { name: 'Users', value: 'admin-users' },
          { name: 'Settings', value: 'admin-settings' },
        ]
      : [
          { name: 'Home', value: 'home' },
          { name: 'Packages', value: 'packages' },
          { name: 'My Bookings', value: 'my-bookings' },
          { name: 'Contact', value: 'contact' },
        ]
    : [
        { name: 'Home', value: 'home' },
        { name: 'Packages', value: 'packages' },
        { name: 'Contact', value: 'contact' },
      ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={() => onNavigate('home')}
              className="text-2xl font-bold text-emerald-600"
            >
              Kerala Tours
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`${
                  currentPage === item.value
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-700 hover:text-emerald-600'
                } px-3 py-2 text-sm font-medium transition-colors`}
              >
                {item.name}
              </button>
            ))}

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <User size={18} />
                  <span>{profile?.username}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex space-x-4">
                <button
                  onClick={() => onNavigate('signin')}
                  className="text-gray-700 hover:text-emerald-600 px-4 py-2 text-sm font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-emerald-600"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => {
                  onNavigate(item.value);
                  setIsMenuOpen(false);
                }}
                className={`${
                  currentPage === item.value
                    ? 'bg-emerald-50 text-emerald-600'
                    : 'text-gray-700 hover:bg-gray-50'
                } block w-full text-left px-3 py-2 rounded-md text-base font-medium`}
              >
                {item.name}
              </button>
            ))}

            {user ? (
              <div className="border-t pt-2 mt-2">
                <div className="px-3 py-2 text-sm text-gray-700">
                  <User size={18} className="inline mr-2" />
                  {profile?.username}
                </div>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={18} className="inline mr-2" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="border-t pt-2 mt-2 space-y-1">
                <button
                  onClick={() => {
                    onNavigate('signin');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate('signup');
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-md"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
