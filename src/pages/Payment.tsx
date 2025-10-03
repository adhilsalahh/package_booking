import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { IndianRupee, Upload, Check } from 'lucide-react';

interface PaymentProps {
  bookingData: any;
  onNavigate: (page: string) => void;
}

export default function Payment({ bookingData, onNavigate }: PaymentProps) {
  const { booking, packageData, settings } = bookingData;
  const [paymentType, setPaymentType] = useState<'advance' | 'full'>('advance');
  const [utrId, setUtrId] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const paymentAmount =
    paymentType === 'advance' ? booking.advance_payment : booking.total_price;

  const generateUpiUrl = () => {
    const upiNumber = settings?.upi_number || '9876543210@ybl';
    const amount = paymentAmount;
    const name = 'Kerala Tours';
    return `upi://pay?pa=${upiNumber}&pn=${encodeURIComponent(name)}&am=${amount}&cu=INR`;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshotFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async () => {
    if (!utrId || !screenshotFile) {
      alert('Please enter UTR ID and upload payment screenshot');
      return;
    }

    setLoading(true);
    try {
      const fileExt = screenshotFile.name.split('.').pop();
      const fileName = `${booking.id}_${Date.now()}.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payments')
        .upload(filePath, screenshotFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payments')
        .getPublicUrl(filePath);

      const { error: paymentError } = await supabase.from('payments').insert([
        {
          booking_id: booking.id,
          amount: paymentAmount,
          payment_type: paymentType,
          utr_id: utrId,
          screenshot_url: publicUrl,
          status: 'pending',
        },
      ]);

      if (paymentError) throw paymentError;

      setSuccess(true);
      setTimeout(() => {
        onNavigate('my-bookings');
      }, 2000);
    } catch (error: any) {
      console.error('Error submitting payment:', error);
      alert(error.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-green-600" size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Your payment is being verified. You will be redirected to your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Complete Payment</h1>

          <div className="bg-emerald-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">{packageData.title}</h2>
            <div className="space-y-2 text-gray-700">
              <p>Booking ID: <span className="font-semibold">{booking.id}</span></p>
              <p>Members: <span className="font-semibold">{booking.number_of_members}</span></p>
              <p>Total Price: <span className="font-semibold">₹{booking.total_price.toLocaleString()}</span></p>
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Select Payment Type
            </label>
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={() => setPaymentType('advance')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  paymentType === 'advance'
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Advance Payment</h3>
                <div className="flex items-center justify-center text-2xl font-bold text-emerald-600">
                  <IndianRupee size={24} />
                  <span>{booking.advance_payment.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Pay ₹500 per person to confirm booking
                </p>
              </button>

              <button
                onClick={() => setPaymentType('full')}
                className={`p-6 rounded-lg border-2 transition-all ${
                  paymentType === 'full'
                    ? 'border-emerald-600 bg-emerald-50'
                    : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">Full Payment</h3>
                <div className="flex items-center justify-center text-2xl font-bold text-emerald-600">
                  <IndianRupee size={24} />
                  <span>{booking.total_price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Pay full amount now
                </p>
              </button>
            </div>
          </div>

          <div className="border-t pt-8 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Instructions</h3>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-center">
              <p className="text-gray-700 mb-4">Scan QR Code or use UPI ID to pay</p>

              <div className="bg-white inline-block p-4 rounded-lg mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generateUpiUrl())}`}
                  alt="UPI QR Code"
                  className="w-48 h-48"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">UPI ID</p>
                <p className="text-lg font-semibold text-gray-900">
                  {settings?.upi_number || '9876543210@ybl'}
                </p>
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-1">Amount to Pay</p>
                <div className="flex items-center justify-center text-2xl font-bold text-emerald-600">
                  <IndianRupee size={24} />
                  <span>{paymentAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  UTR / Transaction ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={utrId}
                  onChange={(e) => setUtrId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Enter 12-digit UTR number"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Find this in your payment confirmation SMS or app
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Screenshot <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <label className="cursor-pointer">
                    <span className="text-emerald-600 hover:text-emerald-700 font-semibold">
                      Click to upload
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {screenshotFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {screenshotFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmitPayment}
            disabled={loading || !utrId || !screenshotFile}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </button>

          <p className="text-center text-gray-600 text-sm mt-4">
            Your booking will be confirmed after payment verification
          </p>
        </div>
      </div>
    </div>
  );
}
