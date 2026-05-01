'use client';

import React, { Suspense, useState } from 'react';
import NearbyRequestsFeed from '@/components/NearbyRequestsFeed';
import CreateRequestForm from '@/components/CreateRequestForm';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function RequestsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [radiusKm, setRadiusKm] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostRequest = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to post a donation request!');
      router.push('/login');
      return;
    }
    setShowCreateForm(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50/50"
    >
        {/* Cinematic Header */}
        <div className="relative bg-[#022c22] py-20 overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/navbar-grid.png')] bg-repeat" />
          </div>
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
              <div className="max-w-2xl">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight"
                >
                  Community <span className="text-emerald-400 underline decoration-emerald-400/30 underline-offset-8">Needs</span>
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-emerald-100/70 mt-4 text-lg font-medium"
                >
                  Discover what people in your neighborhood need or post your own request. 
                  Every small act of sharing builds a stronger community.
                </motion.p>
              </div>
              
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handlePostRequest}
                className="group relative flex items-center gap-3 px-8 py-4 bg-emerald-500 text-black font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:bg-emerald-400"
              >
                <Plus size={24} strokeWidth={3} />
                Post a Request
                <div className="absolute inset-0 rounded-2xl ring-2 ring-emerald-500/50 group-hover:ring-emerald-400/50 transition-all scale-110 opacity-0 group-hover:opacity-100" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
          <div className="space-y-8">
            <Suspense fallback={
              <div className="flex items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
              </div>
            }>
              <NearbyRequestsFeed radiusKm={radiusKm} category={selectedCategory} refreshTrigger={refreshKey} />
            </Suspense>
          </div>
        </div>

        <AnimatePresence>
          {showCreateForm && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/80 backdrop-blur-md z-[190]"
                onClick={() => setShowCreateForm(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100vw-2rem)] max-w-4xl max-h-[90vh] z-[200] bg-white rounded-[3rem] shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col border border-white/20"
              >
                <div className="bg-white px-10 py-8 flex justify-between items-start border-b border-gray-50">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                         <Plus size={20} strokeWidth={3} />
                      </div>
                      <h2 className="text-3xl font-black text-gray-900 tracking-tight">Post Request</h2>
                    </div>
                    <p className="text-gray-400 font-bold text-xs uppercase tracking-widest ml-11">Sharing builds community</p>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="w-12 h-12 flex items-center justify-center rounded-2xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group"
                  >
                    <Plus className="rotate-45 group-hover:scale-110 transition-transform" size={28} strokeWidth={3} />
                  </button>
                </div>
                
                <div className="p-10 overflow-y-auto flex-1 bg-white scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                  <CreateRequestForm
                    onSuccess={() => {
                      setShowCreateForm(false);
                      setRefreshKey(prev => prev + 1);
                      toast.success('Request posted successfully!');
                    }}
                    onCancel={() => setShowCreateForm(false)}
                  />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
  );
}
