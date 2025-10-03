import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import Contact from './pages/Contact';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminPackages from './pages/admin/AdminPackages';

function AppContent() {
  const { user, loading, isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState<any>(null);

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    if (user && isAdmin && currentPage === 'home') {
      setCurrentPage('admin-dashboard');
    }
  }, [user, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (isAdmin) {
      switch (currentPage) {
        case 'admin-dashboard':
          return <AdminDashboard />;
        case 'admin-bookings':
          return <AdminBookings />;
        case 'admin-packages':
          return <AdminPackages />;
        case 'admin-users':
          return (
            <div className="min-h-screen bg-gray-50 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="mt-4 text-gray-600">User management features coming soon...</p>
              </div>
            </div>
          );
        case 'admin-settings':
          return (
            <div className="min-h-screen bg-gray-50 py-12">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-4 text-gray-600">Settings page coming soon...</p>
              </div>
            </div>
          );
        default:
          return <AdminDashboard />;
      }
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} />;
      case 'signup':
        return <SignUp onNavigate={handleNavigate} />;
      case 'signin':
        return <SignIn onNavigate={handleNavigate} />;
      case 'packages':
        return <Packages onNavigate={handleNavigate} />;
      case 'package-detail':
        return <PackageDetail packageData={pageData} onNavigate={handleNavigate} />;
      case 'booking':
        return <Booking packageData={pageData} onNavigate={handleNavigate} />;
      case 'payment':
        return <Payment bookingData={pageData} onNavigate={handleNavigate} />;
      case 'my-bookings':
        return user ? <MyBookings /> : <SignIn onNavigate={handleNavigate} />;
      case 'contact':
        return <Contact />;
      default:
        return <Home onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />
      {renderPage()}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
