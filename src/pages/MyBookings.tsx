import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Users, IndianRupee, Clock } from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    try {
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          packages (title, duration, price_per_head),
          booking_members (name, age, phone),
          payments (amount, payment_type, status, created_at)
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">You haven't made any bookings yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                      {booking.packages.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Booking ID: {booking.id.slice(0, 8)}
                    </p>
                  </div>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="flex items-center text-gray-700">
                    <Calendar className="mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Travel Date</p>
                      <p className="font-semibold">{booking.booking_date}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Clock className="mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="font-semibold">{booking.packages.duration}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-700">
                    <Users className="mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Members</p>
                      <p className="font-semibold">{booking.number_of_members}</p>
                    </div>
                  </div>

                  <div className="flex items-center text-emerald-600">
                    <IndianRupee className="mr-2" size={18} />
                    <div>
                      <p className="text-xs text-gray-500">Total Price</p>
                      <p className="font-semibold">₹{booking.total_price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Members</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {booking.booking_members.map((member: any, idx: number) => (
                      <div key={idx} className="bg-gray-50 rounded p-3 text-sm">
                        <p className="font-semibold text-gray-900">{member.name}</p>
                        <p className="text-gray-600">Age: {member.age}</p>
                        {member.phone && (
                          <p className="text-gray-600">Phone: {member.phone}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {booking.payments && booking.payments.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Payments</h3>
                    <div className="space-y-2">
                      {booking.payments.map((payment: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center bg-gray-50 rounded p-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-gray-900">
                              {payment.payment_type === 'advance' ? 'Advance' : 'Full'} Payment
                            </p>
                            <p className="text-gray-600 text-xs">
                              {new Date(payment.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-emerald-600">
                              ₹{payment.amount.toLocaleString()}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                payment.status === 'verified'
                                  ? 'bg-green-100 text-green-700'
                                  : payment.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="bg-emerald-50 rounded p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-700">Advance Paid</span>
                      <span className="font-semibold">₹{booking.advance_payment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700">Remaining Payment</span>
                      <span className="font-semibold text-emerald-600">
                        ₹{booking.remaining_payment.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
