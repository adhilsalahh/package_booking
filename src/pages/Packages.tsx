import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, Clock, IndianRupee } from 'lucide-react';

interface Package {
  id: string;
  title: string;
  description: string;
  images: string[];
  price_per_head: number;
  duration: string;
  is_active: boolean;
}

interface PackagesProps {
  onNavigate: (page: string, data?: any) => void;
}

export default function Packages({ onNavigate }: PackagesProps) {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Tour Packages</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Choose from our carefully crafted Kerala tour packages and create memories that last a lifetime
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No packages available at the moment.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={
                      pkg.images && pkg.images.length > 0
                        ? pkg.images[0]
                        : 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800'
                    }
                    alt={pkg.title}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-gray-700">
                      <Clock size={18} className="mr-2" />
                      <span className="text-sm">{pkg.duration}</span>
                    </div>
                    <div className="flex items-center text-emerald-600 font-bold text-lg">
                      <IndianRupee size={18} />
                      <span>{pkg.price_per_head.toLocaleString()}</span>
                      <span className="text-sm text-gray-600 ml-1">/person</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onNavigate('package-detail', pkg)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
