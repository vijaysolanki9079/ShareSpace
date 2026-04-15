'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, MapPin, AlertCircle, Check } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface ItemCategory {
  id: string;
  name: string;
  description?: string;
}

interface CreateRequestFormProps {
  onSuccess?: (requestId: string) => void;
  onCancel?: () => void;
}

export default function CreateRequestForm({
  onSuccess,
  onCancel,
}: CreateRequestFormProps) {
  const { data: session } = useSession();
  const [formState, setFormState] = useState({
    title: '',
    description: '',
    categoryId: '',
    locationName: '',
    latitude: 0,
    longitude: 0,
    radius: 5000,
    images: [] as string[],
  });

  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormState((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
        },
        (error) => {
          console.log('Location access denied:', error);
          // Default to Delhi if user denies location
          setFormState((prev) => ({
            ...prev,
            latitude: 28.6139,
            longitude: 77.209,
            locationName: 'Delhi (default)',
          }));
        }
      );
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/requests/categories');
      const data = await res.json();

      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormState((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setGettingLocation(false);
        },
        (error) => {
          setError('Could not get your location. Please type it manually.');
          setGettingLocation(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formState.title.trim()) {
      setError('Please enter a title');
      setLoading(false);
      return;
    }

    if (!formState.description.trim()) {
      setError('Please enter a description');
      setLoading(false);
      return;
    }

    if (!formState.categoryId) {
      setError('Please select a category');
      setLoading(false);
      return;
    }

    if (!formState.latitude || !formState.longitude) {
      setError('Please set your location');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create request');
        setLoading(false);
        return;
      }

      const data = await response.json();
      setSuccess(true);

      // Reset form
      setFormState({
        title: '',
        description: '',
        categoryId: '',
        locationName: '',
        latitude: 0,
        longitude: 0,
        radius: 5000,
        images: [],
      });

      setTimeout(() => {
        if (onSuccess) onSuccess(data.requestId);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  if (!session?.user) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800">
          Please log in to create a donation request.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Post a Donation Request
      </h2>

      {success && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center gap-3 text-green-800"
        >
          <Check size={20} />
          <span>Request created successfully! 🎉</span>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg flex items-center gap-3 text-red-800"
        >
          <AlertCircle size={20} />
          <span>{error}</span>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do you need? *
          </label>
          <input
            type="text"
            value={formState.title}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="e.g., Used sofa, children's books, old laptop"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formState.description}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="Describe what you need in detail. Mention condition, size, color, or specific requirements..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formState.categoryId}
            onChange={(e) =>
              setFormState((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)} -{' '}
                {cat.description}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Your Location *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formState.locationName}
              onChange={(e) =>
                setFormState((prev) => ({
                  ...prev,
                  locationName: e.target.value,
                }))
              }
              placeholder="e.g., Delhi - Sector 5"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              disabled={loading}
            />
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={loading || gettingLocation}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
            >
              <MapPin size={18} />
              {gettingLocation ? 'Getting...' : 'Detect'}
            </button>
          </div>
          {formState.latitude && formState.longitude && (
            <p className="text-sm text-gray-500">
              Coordinates: {formState.latitude.toFixed(4)},
              {formState.longitude.toFixed(4)}
            </p>
          )}
        </div>

        {/* Radius */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Radius (km)
          </label>
          <input
            type="range"
            min="1"
            max="25"
            step="1"
            value={formState.radius / 1000}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                radius: parseInt(e.target.value) * 1000,
              }))
            }
            className="w-full"
            disabled={loading}
          />
          <p className="text-sm text-gray-600 mt-2">
            Donors can see this request within {formState.radius / 1000} km
          </p>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Photos
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500">
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600">
              Drag photos here or click to select (optional)
            </p>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Note: Image upload coming soon
          </p>
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Post Request'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 disabled:bg-gray-100"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </motion.div>
  );
}
