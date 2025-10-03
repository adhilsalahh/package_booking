import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, IndianRupee, Calendar, User, Phone } from 'lucide-react';

interface BookingProps {
  packageData: any;
  onNavigate: (page: string, data?: any) => void;
}

interface Member {
  name: string;
  age: string;
  phone: string;
}

export default function Booking({ packageData, onNavigate }: BookingProps) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [numberOfMembers, setNumberOfMembers] = useState(1);
  const [members, setMembers] = useState<Member[]>([{ name: '', age: '', phone: '' }]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const advancePerHead = 500;
  const totalPrice = numberOfMembers * packageData.price_per_head;
  const totalAdvance = numberOfMembers * advancePerHead;
  const remainingPayment = totalPrice - totalAdvance;

  useEffect(() => {
    if (profile) {
      setMembers([
        {
          name: profile.username,
          age: '',
          phone: profile.phone,
        },
      ]);
    }
    fetchSettings();
  }, [profile]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('web_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleMembersChange = (count: number) => {
    setNumberOfMembers(count);
    const newMembers = Array.from({ length: count }, (_, i) => members[i] || { name: '', age: '', phone: '' });
    setMembers(newMembers);
  };

  const handleMemberChange = (index: number, field: keyof Member, value: string) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
  };

  const handleSubmitBooking = async () => {
    if (!selectedDate) {
      alert('Please select a booking date');
      return;
    }

    const allMembersValid = members.every(m => m.name && m.age);
    if (!allMembersValid) {
      alert('Please fill in all member details (name and age are required)');
      return;
    }

    setLoading(true);
    try {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert([
          {
            user_id: user!.id,
            package_id: packageData.id,
            booking_date: selectedDate,
            number_of_members: numberOfMembers,
            total_price: totalPrice,
            advance_payment: totalAdvance,
            remaining_payment: remainingPayment,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (bookingError) throw bookingError;

      const memberInserts = members.map((member) => ({
        booking_id: booking.id,
        name: member.name,
        age: parseInt(member.age),
        phone: member.phone || null,
      }));

      const { error: membersError } = await supabase
        .from('booking_members')
        .insert(memberInserts);

      if (membersError) throw membersError;

      onNavigate('payment', { booking, packageData, settings });
    } catch (error: any) {
      console.error('Error creating booking:', error);
      alert(error.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const availableDates = packageData.available_dates || [];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('package-detail', packageData)}
          className="text-emerald-600 hover:text-emerald-700 mb-6"
        >
          ← Back to Package
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Book Your Trip</h1>

          <div className="bg-emerald-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{packageData.title}</h2>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">{packageData.duration}</span>
              <div className="flex items-center text-emerald-600 font-bold text-xl">
                <IndianRupee size={20} />
                <span>{packageData.price_per_head.toLocaleString()}</span>
                <span className="text-sm text-gray-600 ml-1">/person</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline mr-2" size={18} />
                Select Date
              </label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              >
                <option value="">Choose a date</option>
                {availableDates.map((dateObj: any, idx: number) => (
                  <option key={idx} value={dateObj.date}>
                    {dateObj.date}
                    {dateObj.slotsAvailable ? ` (${dateObj.slotsAvailable} slots available)` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Users className="inline mr-2" size={18} />
                Number of Members
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={numberOfMembers}
                onChange={(e) => handleMembersChange(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Member Details</h3>
              <div className="space-y-6">
                {members.map((member, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Member {index + 1}
                      {index === 0 && ' (You)'}
                    </h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-3 text-gray-400" size={18} />
                          <input
                            type="text"
                            required
                            value={member.name}
                            onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Full name"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Age <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          value={member.age}
                          onChange={(e) => handleMemberChange(index, 'age', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Age"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          Phone (Optional)
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                          <input
                            type="tel"
                            value={member.phone}
                            onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            placeholder="Phone number"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Price per person</span>
                  <span className="font-semibold">₹{packageData.price_per_head.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Number of members</span>
                  <span className="font-semibold">{numberOfMembers}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-semibold">Total Price</span>
                  <span className="font-bold text-emerald-600">₹{totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Advance Payment (₹{advancePerHead}/person)</span>
                  <span className="font-semibold">₹{totalAdvance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Remaining Payment</span>
                  <span className="font-semibold">₹{remainingPayment.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleSubmitBooking}
              disabled={loading || !selectedDate}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
