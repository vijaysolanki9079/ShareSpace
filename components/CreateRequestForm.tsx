'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, MapPin, AlertCircle, Check, Info, ArrowRight } from 'lucide-react';
import ItemAutocomplete from './ItemAutocomplete';
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

  useEffect(() => {
    fetchCategories();
    handleGetLocation();
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
          console.warn('Location access denied');
          setGettingLocation(false);
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!formState.title.trim() || !formState.description.trim() || !formState.categoryId) {
      setError('Please fill in all required fields');
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
        throw new Error(data.error || 'Failed to create request');
      }

      const data = await response.json();
      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess(data.requestId);
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (!session?.user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      {success ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
            <Check size={48} strokeWidth={3} />
          </div>
          <h3 className="text-3xl font-black text-gray-900 mb-2">Request Posted!</h3>
          <p className="text-gray-500 font-medium">Your community can now see what you need.</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column: Core Info */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 block">1. What do you need?</label>
               <ItemAutocomplete
                value={formState.title}
                onChange={(val) => setFormState((prev) => ({ ...prev, title: val }))}
                placeholder="e.g., Sofa, Books, Laptop"
              />
              <p className="mt-4 text-xs text-gray-400 flex items-center gap-2">
                <Info size={14} /> Try to be as specific as possible
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 block">2. Describe the need</label>
               <textarea
                value={formState.description}
                onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Briefly explain why you need this item and what condition you're looking for..."
                rows={5}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all resize-none"
              />
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 block">3. Select Category</label>
               <div className="grid grid-cols-2 gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setFormState(p => ({ ...p, categoryId: cat.id }))}
                      className={`px-4 py-3 rounded-xl text-xs font-bold transition-all text-left border ${
                        formState.categoryId === cat.id 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg' 
                        : 'bg-gray-50 text-gray-600 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
               </div>
            </div>
          </div>

          {/* Right Column: Location & Extras */}
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 block">4. Location & Reach</label>
               <div className="space-y-4">
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formState.locationName}
                      onChange={(e) => setFormState(p => ({ ...p, locationName: e.target.value }))}
                      placeholder="Your neighborhood (e.g., Koramangala)"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-black text-emerald-800 uppercase tracking-tight">Visibility Radius</span>
                      <span className="text-xs font-bold text-emerald-600 bg-white px-2 py-1 rounded-lg border border-emerald-200">{formState.radius/1000} km</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      value={formState.radius/1000}
                      onChange={(e) => setFormState(p => ({ ...p, radius: parseInt(e.target.value)*1000 }))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
               </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
               <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-4 block">5. Media (Optional)</label>
               <div className="border-2 border-dashed border-gray-100 rounded-3xl p-10 text-center flex flex-col items-center justify-center bg-gray-50/50 hover:bg-emerald-50 transition-colors group cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-emerald-500 shadow-sm mb-3 transition-colors">
                    <Upload size={24} />
                  </div>
                  <p className="text-xs font-bold text-gray-500 group-hover:text-emerald-700">Add an example image</p>
                  <p className="text-[10px] text-gray-400 mt-1">Help donors identify the item faster</p>
               </div>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700 text-sm font-medium">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="flex gap-4">
               {onCancel && (
                 <button
                   type="button"
                   onClick={onCancel}
                   className="flex-1 py-4 bg-gray-100 text-gray-600 font-bold rounded-2xl hover:bg-gray-200 transition-all"
                 >
                   Discard
                 </button>
               )}
               <button
                 type="submit"
                 disabled={loading}
                 className="flex-[2] py-4 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 shadow-xl shadow-emerald-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {loading ? 'Posting...' : (
                   <>
                     Confirm & Post
                     <ArrowRight size={18} strokeWidth={3} />
                   </>
                 )}
               </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
