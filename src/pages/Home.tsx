import { MapPin, Calendar, Users, Award } from 'lucide-react';

interface HomeProps {
  onNavigate: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  return (
    <div className="min-h-screen">
      <div
        className="relative h-[600px] bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            'url(https://images.pexels.com/photos/962464/pexels-photo-962464.jpeg?auto=compress&cs=tinysrgb&w=1920)',
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Discover God's Own Country
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
            Experience the beauty of Kerala with our carefully curated tour packages
          </p>
          <button
            onClick={() => onNavigate('packages')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
          >
            Explore Packages
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Kerala Tours?
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We offer the best travel experiences with carefully planned itineraries
            and exceptional service
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <MapPin className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Best Destinations</h3>
            <p className="text-gray-600">
              Explore the most beautiful and scenic locations across Kerala
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Calendar className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Flexible Dates</h3>
            <p className="text-gray-600">
              Choose from multiple available dates that suit your schedule
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Users className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Group Friendly</h3>
            <p className="text-gray-600">
              Perfect for families, friends, and solo travelers alike
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
              <Award className="text-emerald-600" size={32} />
            </div>
            <h3 className="text-xl font-semibold mb-2">Quality Service</h3>
            <p className="text-gray-600">
              Experience top-notch service and memorable moments throughout your journey
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to Start Your Journey?
              </h2>
              <p className="text-gray-700 mb-6 text-lg">
                Browse our exclusive Kerala tour packages and book your dream vacation today.
                Create an account to unlock special offers and track your bookings.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => onNavigate('packages')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  View Packages
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="bg-white hover:bg-gray-50 text-emerald-600 border-2 border-emerald-600 px-6 py-3 rounded-lg font-semibold"
                >
                  Sign Up Now
                </button>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="https://images.pexels.com/photos/3225531/pexels-photo-3225531.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Kerala Tourism"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
