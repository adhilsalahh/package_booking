import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Users, Clock, CheckCircle, IndianRupee } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    totalUsers: 0,
    totalPackages: 0,
    totalPayments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [bookings, users, packages, payments] = await Promise.all([
        supabase.from('bookings').select('status, total_price', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('packages').select('id', { count: 'exact' }),
        supabase
          .from('payments')
          .select('amount')
          .eq('status', 'verified'),
      ]);

      const totalPayments =
        payments.data?.reduce((sum, p) => sum + p.amount, 0) || 0;
      const pendingCount =
        bookings.data?.filter((b) => b.status === 'pending').length || 0;
      const confirmedCount =
        bookings.data?.filter((b) => b.status === 'confirmed').length || 0;

      setStats({
        totalBookings: bookings.count || 0,
        pendingBookings: pendingCount,
        confirmedBookings: confirmedCount,
        totalUsers: users.count || 0,
        totalPackages: packages.count || 0,
        totalPayments,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Bookings',
      value: stats.totalBookings,
      icon: Clock,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      title: 'Pending Bookings',
      value: stats.pendingBookings,
      icon: Clock,
      color: 'bg-yellow-100 text-yellow-600',
    },
    {
      title: 'Confirmed Bookings',
      value: stats.confirmedBookings,
      icon: CheckCircle,
      color: 'bg-green-100 text-green-600',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      title: 'Total Packages',
      value: stats.totalPackages,
      icon: Package,
      color: 'bg-indigo-100 text-indigo-600',
    },
    {
      title: 'Total Payments',
      value: `₹${stats.totalPayments.toLocaleString()}`,
      icon: IndianRupee,
      color: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${stat.color}`}>
                  <stat.icon size={28} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
