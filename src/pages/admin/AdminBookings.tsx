import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Eye } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          profiles (username, email, phone),
          packages (title, duration, price_per_head),
          booking_members (name, age, phone),
          payments (amount, payment_type, status, utr_id, screenshot_url, created_at)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const confirmBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId);

      if (error) throw error;

      alert('Booking confirmed successfully!');
      fetchBookings();
      setSelectedBooking(null);
    } catch (error: any) {
      console.error('Error confirming booking:', error);
      alert(error.message || 'Failed to confirm booking');
    }
  };

  const verifyPayment = async (paymentId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', paymentId);

      if (error) throw error;

      alert(`Payment ${status} successfully!`);
      fetchBookings();
    } catch (error: any) {
      console.error('Error updating payment:', error);
      alert(error.message || 'Failed to update payment');
    }
  };

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Bookings</h1>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'pending'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-lg font-medium ${
                filter === 'confirmed'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Confirmed
            </button>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {booking.packages.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Customer: {booking.profiles.username} ({booking.profiles.email})
                    </p>
                    <p className="text-gray-600 text-sm">
                      Phone: {booking.profiles.phone}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-500">Travel Date</p>
                    <p className="font-semibold">{booking.booking_date}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Members</p>
                    <p className="font-semibold">{booking.number_of_members}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Amount</p>
                    <p className="font-semibold text-emerald-600">
                      ₹{booking.total_price.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Booked On</p>
                    <p className="font-semibold">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="flex items-center space-x-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Eye size={18} />
                    <span>View Details</span>
                  </button>

                  {booking.status === 'pending' && (
                    <button
                      onClick={() => confirmBooking(booking.id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Check size={18} />
                      <span>Confirm Booking</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Members</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedBooking.booking_members.map((member: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 rounded p-3">
                      <p className="font-semibold">{member.name}</p>
                      <p className="text-sm text-gray-600">Age: {member.age}</p>
                      {member.phone && (
                        <p className="text-sm text-gray-600">Phone: {member.phone}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Payments</h3>
                {selectedBooking.payments.length === 0 ? (
                  <p className="text-gray-600">No payments yet</p>
                ) : (
                  <div className="space-y-3">
                    {selectedBooking.payments.map((payment: any) => (
                      <div key={payment.id} className="bg-gray-50 rounded p-4">
                        <div className="flex justify-between mb-2">
                          <div>
                            <p className="font-semibold">
                              {payment.payment_type === 'advance' ? 'Advance' : 'Full'} Payment
                            </p>
                            <p className="text-sm text-gray-600">UTR: {payment.utr_id}</p>
                          </div>
                          <p className="font-bold text-emerald-600">
                            ₹{payment.amount.toLocaleString()}
                          </p>
                        </div>

                        <div className="mb-3">
                          <a
                            href={payment.screenshot_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            View Screenshot
                          </a>
                        </div>

                        <div className="flex space-x-2">
                          {payment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => verifyPayment(payment.id, 'verified')}
                                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                <Check size={16} />
                                <span>Verify</span>
                              </button>
                              <button
                                onClick={() => verifyPayment(payment.id, 'rejected')}
                                className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                <X size={16} />
                                <span>Reject</span>
                              </button>
                            </>
                          )}
                          {payment.status !== 'pending' && (
                            <span
                              className={`px-3 py-1 rounded text-sm ${
                                payment.status === 'verified'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {payment.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
