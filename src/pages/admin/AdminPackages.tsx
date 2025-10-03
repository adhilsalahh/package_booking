import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, CreditCard as Edit, Trash2, X } from 'lucide-react';

export default function AdminPackages() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_per_head: '',
    duration: '',
    images: '',
    itinerary: '',
    inclusions: '',
    exclusions: '',
    available_dates: '',
    is_active: true,
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPackages(data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pkg: any = null) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        title: pkg.title,
        description: pkg.description,
        price_per_head: pkg.price_per_head.toString(),
        duration: pkg.duration,
        images: JSON.stringify(pkg.images),
        itinerary: JSON.stringify(pkg.itinerary),
        inclusions: pkg.inclusions.join('\n'),
        exclusions: pkg.exclusions.join('\n'),
        available_dates: JSON.stringify(pkg.available_dates),
        is_active: pkg.is_active,
      });
    } else {
      setEditingPackage(null);
      setFormData({
        title: '',
        description: '',
        price_per_head: '',
        duration: '',
        images: '[]',
        itinerary: '[]',
        inclusions: '',
        exclusions: '',
        available_dates: '[]',
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const packageData = {
        title: formData.title,
        description: formData.description,
        price_per_head: parseFloat(formData.price_per_head),
        duration: formData.duration,
        images: JSON.parse(formData.images),
        itinerary: JSON.parse(formData.itinerary),
        inclusions: formData.inclusions.split('\n').filter(Boolean),
        exclusions: formData.exclusions.split('\n').filter(Boolean),
        available_dates: JSON.parse(formData.available_dates),
        is_active: formData.is_active,
      };

      if (editingPackage) {
        const { error } = await supabase
          .from('packages')
          .update(packageData)
          .eq('id', editingPackage.id);

        if (error) throw error;
        alert('Package updated successfully!');
      } else {
        const { error } = await supabase.from('packages').insert([packageData]);

        if (error) throw error;
        alert('Package created successfully!');
      }

      setShowModal(false);
      fetchPackages();
    } catch (error: any) {
      console.error('Error saving package:', error);
      alert(error.message || 'Failed to save package');
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return;

    try {
      const { error } = await supabase.from('packages').delete().eq('id', id);

      if (error) throw error;
      alert('Package deleted successfully!');
      fetchPackages();
    } catch (error: any) {
      console.error('Error deleting package:', error);
      alert(error.message || 'Failed to delete package');
    }
  };

  if (loading && !showModal) {
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
          <h1 className="text-3xl font-bold text-gray-900">Manage Packages</h1>
          <button
            onClick={() => openModal()}
            className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700"
          >
            <Plus size={20} />
            <span>Add Package</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{pkg.title}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      pkg.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {pkg.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>

                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-700">{pkg.duration}</span>
                  <span className="text-emerald-600 font-bold">
                    ₹{pkg.price_per_head.toLocaleString()}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openModal(pkg)}
                    className="flex items-center justify-center space-x-1 flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => deletePackage(pkg.id)}
                    className="flex items-center justify-center space-x-1 flex-1 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPackage ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per Head <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={formData.price_per_head}
                    onChange={(e) => setFormData({ ...formData, price_per_head: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 5 Days 4 Nights"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images (JSON array of URLs)
                </label>
                <textarea
                  rows={2}
                  value={formData.images}
                  onChange={(e) => setFormData({ ...formData, images: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder='["url1", "url2"]'
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inclusions (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.inclusions}
                    onChange={(e) => setFormData({ ...formData, inclusions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exclusions (one per line)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.exclusions}
                    onChange={(e) => setFormData({ ...formData, exclusions: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Itinerary (JSON format)
                </label>
                <textarea
                  rows={3}
                  value={formData.itinerary}
                  onChange={(e) => setFormData({ ...formData, itinerary: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder='[{"day": 1, "title": "Arrival", "description": "..."}]'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Dates (JSON format)
                </label>
                <textarea
                  rows={2}
                  value={formData.available_dates}
                  onChange={(e) => setFormData({ ...formData, available_dates: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder='[{"date": "2025-11-15", "slotsAvailable": 10}]'
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold"
                >
                  {loading ? 'Saving...' : editingPackage ? 'Update Package' : 'Create Package'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
