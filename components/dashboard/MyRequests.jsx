'use client';

import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, XCircle, MapPin, User, MessageCircle } from 'lucide-react';

const MyRequests = () => {
  const [filter, setFilter] = useState('all');

  const requests = [
    {
      id: 1,
      title: 'Study Desk',
      category: 'Furniture',
      condition: 'Good Condition',
      status: 'pending',
      donor: 'John Doe',
      distance: '2.5 km',
      date: '2024-01-22',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      title: 'Fiction Books Bundle',
      category: 'Books',
      condition: 'Like New',
      status: 'approved',
      donor: 'Sarah Chen',
      distance: '1.2 km',
      date: '2024-01-21',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      title: 'Winter Blankets',
      category: 'Household',
      condition: 'Good',
      status: 'completed',
      donor: 'Community Drive',
      distance: '0.8 km',
      date: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=300&fit=crop',
    },
    {
      id: 4,
      title: 'Kids Bicycle',
      category: 'Toys',
      condition: 'Used',
      status: 'rejected',
      donor: 'Mike Wilson',
      distance: '3.5 km',
      date: '2024-01-18',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
    },
  ];

  const filteredRequests = filter === 'all' 
    ? requests 
    : requests.filter(r => r.status === filter);

  const getStatusBadge = (status) => {
    const badges = {
      approved: { text: 'Approved', bg: 'bg-emerald-50', textColor: 'text-emerald-600', icon: CheckCircle2 },
      pending: { text: 'Pending', bg: 'bg-amber-50', textColor: 'text-amber-600', icon: Clock },
      completed: { text: 'Completed', bg: 'bg-blue-50', textColor: 'text-blue-600', icon: CheckCircle2 },
      rejected: { text: 'Rejected', bg: 'bg-red-50', textColor: 'text-red-600', icon: XCircle },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
          <p className="text-gray-600">Items you&apos;ve requested from donors in your area.</p>
        </div>
        <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-emerald-500/30">
          Browse Items
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'completed', 'rejected'].map((filterOption) => (
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

      {/* Requests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((request) => {
          const statusBadge = getStatusBadge(request.status);
          const StatusIcon = statusBadge.icon;

          return (
            <div
              key={request.id}
              className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={request.image}
                  alt={request.title}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3">
                  <div className={`${statusBadge.bg} ${statusBadge.textColor} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5`}>
                    <StatusIcon className="w-3 h-3" />
                    {statusBadge.text}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase">
                  {request.category}
                </div>
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {request.distance}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                  {request.title}
                </h3>
                
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {request.condition}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{request.donor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(request.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <button className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2.5 text-sm font-semibold text-gray-600 border-2 border-gray-100 rounded-xl hover:border-emerald-500 hover:text-emerald-600 transition-all">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {request.status === 'approved' && (
                  <button className="w-full mt-4 py-2.5 text-sm font-semibold text-emerald-600 border-2 border-emerald-500 rounded-xl hover:bg-emerald-50 transition-all">
                    Arrange Pickup
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600 mb-6">Start requesting items from your community!</p>
          <button className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
            Browse Available Items
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
