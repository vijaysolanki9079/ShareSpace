'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'next-auth/react';

const NGODashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <ProtectedRoute requiredType="ngo">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 p-6"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                <p className="text-gray-600 mt-1">NGO Partner Dashboard</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-200">
            {['overview', 'campaigns', 'requests', 'messages', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-6 font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Content by Tab */}
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-lg">
                    <div className="text-sm font-semibold text-gray-600">Active Campaigns</div>
                    <div className="text-3xl font-bold text-emerald-600">3</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg">
                    <div className="text-sm font-semibold text-gray-600">Pending Requests</div>
                    <div className="text-3xl font-bold text-blue-600">12</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg">
                    <div className="text-sm font-semibold text-gray-600">Items Received</div>
                    <div className="text-3xl font-bold text-purple-600">245</div>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Organization Details</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Organization Name</span>
                      <span className="font-medium text-gray-900">{user?.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b">
                      <span className="text-gray-600">Email</span>
                      <span className="font-medium text-gray-900">{user?.email}</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Verification Status</span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pending Verification
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'campaigns' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Campaigns</h3>
                <p className="text-gray-600">No campaigns yet. Create one to get started!</p>
              </div>
            )}

            {activeTab === 'requests' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Requests</h3>
                <p className="text-gray-600">You have 12 pending requests from the community.</p>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Messages</h3>
                <p className="text-gray-600">No new messages.</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                <p className="text-gray-600">Update your organization profile and preferences.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
};

export default NGODashboard;
