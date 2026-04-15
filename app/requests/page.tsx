'use client';

import React, { Suspense, useState } from 'react';
import SiteChrome from '@/components/SiteChrome';
import NearbyRequestsFeed from '@/components/NearbyRequestsFeed';
import CreateRequestForm from '@/components/CreateRequestForm';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export default function RequestsPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('');

  return (
    <SiteChrome>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50"
      >
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Donation Requests
                </h1>
                <p className="text-gray-600 mt-1">
                  Help people in your community by donating used items
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Post a Request
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Radius
                </label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>1 km</option>
                  <option value={5}>5 km</option>
                  <option value={10}>10 km</option>
                  <option value={15}>15 km</option>
                  <option value={25}>25 km</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8 fixed inset-4 z-50 bg-white rounded-xl shadow-2xl overflow-y-auto max-h-screen"
            >
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">Create a Donation Request</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              <div className="p-6">
                <CreateRequestForm
                  onSuccess={() => {
                    setShowCreateForm(false);
                    // Optionally refresh the feed
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            </motion.div>
          )}

          {showCreateForm && (
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowCreateForm(false)}
            />
          )}

          <Suspense fallback={<div>Loading requests...</div>}>
            <NearbyRequestsFeed radiusKm={radiusKm} category={selectedCategory} />
          </Suspense>
        </div>
      </motion.div>
    </SiteChrome>
  );
}
