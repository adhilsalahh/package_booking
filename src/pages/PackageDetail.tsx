import { useState } from 'react';
import { Clock, IndianRupee, Check, X, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface PackageDetailProps {
  packageData: any;
  onNavigate: (page: string, data?: any) => void;
}

export default function PackageDetail({ packageData, onNavigate }: PackageDetailProps) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);

  const images =
    packageData.images && packageData.images.length > 0
      ? packageData.images
      : ['https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=1200'];

  const itinerary = packageData.itinerary || [];
  const inclusions = packageData.inclusions || [];
  const exclusions = packageData.exclusions || [];
  const availableDates = packageData.available_dates || [];

  const handleBookNow = () => {
    if (!user) {
      onNavigate('signin');
      return;
    }
    onNavigate('booking', packageData);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('packages')}
          className="text-emerald-600 hover:text-emerald-700 mb-6 flex items-center"
        >
          ← Back to Packages
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            <div className="relative">
              <img
                src={images[selectedImage]}
                alt={packageData.title}
                className="w-full h-[500px] object-cover"
              />
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-3 h-3 rounded-full ${
                        selectedImage === idx ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {packageData.title}
              </h1>

              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center text-gray-700">
                  <Clock size={20} className="mr-2" />
                  <span>{packageData.duration}</span>
                </div>
                <div className="flex items-center text-emerald-600 font-bold text-2xl">
                  <IndianRupee size={24} />
                  <span>{packageData.price_per_head.toLocaleString()}</span>
                  <span className="text-sm text-gray-600 ml-1">/person</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6 leading-relaxed">
                {packageData.description}
              </p>

              <button
                onClick={handleBookNow}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Book Now
              </button>

              {!user && (
                <p className="text-center text-gray-600 text-sm mt-2">
                  Please sign in to book this package
                </p>
              )}
            </div>
          </div>

          <div className="p-8 border-t">
            {itinerary.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Itinerary</h2>
                <div className="space-y-4">
                  {itinerary.map((day: any, idx: number) => (
                    <div key={idx} className="flex">
                      <div className="flex-shrink-0 w-20">
                        <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                          Day {day.day}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{day.title}</h3>
                        <p className="text-gray-600">{day.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {inclusions.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Inclusions</h2>
                  <ul className="space-y-2">
                    {inclusions.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <Check className="text-emerald-600 mr-2 flex-shrink-0 mt-1" size={18} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {exclusions.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Exclusions</h2>
                  <ul className="space-y-2">
                    {exclusions.map((item: string, idx: number) => (
                      <li key={idx} className="flex items-start">
                        <X className="text-red-600 mr-2 flex-shrink-0 mt-1" size={18} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {availableDates.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Dates</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {availableDates.map((dateObj: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-gray-50 p-4 rounded-lg text-center border border-gray-200"
                    >
                      <Calendar className="text-emerald-600 mx-auto mb-2" size={24} />
                      <p className="text-sm font-semibold text-gray-900">
                        {dateObj.date}
                      </p>
                      {dateObj.slotsAvailable && (
                        <p className="text-xs text-gray-600 mt-1">
                          {dateObj.slotsAvailable} slots
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
