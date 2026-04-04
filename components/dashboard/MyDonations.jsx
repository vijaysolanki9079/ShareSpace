'use client';

import React, { useState } from 'react';
import { Gift, CheckCircle2, Clock, XCircle, User } from 'lucide-react';

const MyDonations = () => {
  const [filter, setFilter] = useState('all');

  const donations = [
    {
      id: 1,
      title: 'Winter Jacket - Size M',
      category: 'Clothes',
      condition: 'Like New',
      status: 'completed',
      recipient: 'City Shelter NGO',
      date: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Study Desk with Chair',
      category: 'Furniture',
      condition: 'Good',
      status: 'pending',
      recipient: 'Education Foundation',
      date: '2024-01-20',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Children\'s Books Collection',
      category: 'Books',
      condition: 'Like New',
      status: 'completed',
      recipient: 'Vidya Arogaya Sansthan',
      date: '2024-01-10',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
    },
    {
      id: 4,
      title: 'Kitchen Utensils Set',
      category: 'Household',
      condition: 'Good',
      status: 'cancelled',
      recipient: 'Community Kitchen',
      date: '2024-01-18',
      image: 'https://images.unsplash.com/photo-1556910096-6f5e72db6803?w=400&h=300&fit=crop',
    },
  ];

  const filteredDonations = filter === 'all' 
    ? donations 
    : donations.filter(d => d.status === filter);

  const getStatusBadge = (status) => {
    const badges = {
      completed: { text: 'Completed', bg: 'bg-emerald-50', textColor: 'text-emerald-600', icon: CheckCircle2 },
      pending: { text: 'Pending', bg: 'bg-amber-50', textColor: 'text-amber-600', icon: Clock },
      cancelled: { text: 'Cancelled', bg: 'bg-red-50', textColor: 'text-red-600', icon: XCircle },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Donations</h1>
          <p className="text-gray-600">Track all the items you&apos;ve shared with your community.</p>
        </div>
        <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30">
          Donate New Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['all', 'pending', 'completed', 'cancelled'].map((filterOption) => (
          <button
            key={filterOption}
            onClick={() => setFilter(filterOption)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              filter === filterOption
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      {/* Donations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDonations.map((donation) => {
          const statusBadge = getStatusBadge(donation.status);
          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={donation.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={donation.image}
                  alt={donation.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <div className={`${statusBadge.bg} ${statusBadge.textColor} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase">
                  {donation.category}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {donation.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {donation.condition}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{donation.recipient}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(donation.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {donation.status === 'pending' && (
                  <button className="w-full mt-4 py-2.5 text-sm font-semibold text-gray-900 border-2 border-gray-100 rounded-xl hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                    View Details
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredDonations.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No donations found</h3>
          <p className="text-gray-600 mb-6">Start sharing items with your community!</p>
          <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Donate Your First Item
          </button>
        </div>
      )}
    </div>
  );
};

export default MyDonations;
