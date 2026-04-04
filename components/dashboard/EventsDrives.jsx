'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

const EventsDrives = () => {
  const [filter, setFilter] = useState('upcoming');

  const events = [
    {
      id: 1,
      title: 'Winter Warmth Drive',
      organizer: 'City Shelter NGO',
      category: 'Winter Drive',
      date: '2024-02-15',
      time: '10:00 AM',
      location: 'Community Center, Indiranagar',
      distance: '1.2 km',
      attendees: 45,
      status: 'upcoming',
      description: 'Collecting jackets, blankets, and warm clothes for the homeless community.',
      image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=600&h=400&fit=crop',
    },
    {
      id: 2,
      title: 'Back to School Campaign',
      organizer: 'Vidya Arogaya Sansthan',
      category: 'Education',
      date: '2024-02-20',
      time: '2:00 PM',
      location: 'School Ground, Koramangala',
      distance: '3.5 km',
      attendees: 120,
      status: 'upcoming',
      description: 'Help underprivileged kids start the year right. We need backpacks, notebooks, and pens.',
      image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop',
    },
    {
      id: 3,
      title: 'Community Food Drive',
      organizer: 'Annapoorna Food Relief',
      category: 'Food Relief',
      date: '2024-01-28',
      time: '9:00 AM',
      location: 'Downtown Community Hall',
      distance: '2.8 km',
      attendees: 89,
      status: 'past',
      description: 'Urgent need for non-perishable food items for the Downtown Community Pantry.',
      image: 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=600&h=400&fit=crop',
    },
    {
      id: 4,
      title: 'Animal Care Awareness Day',
      organizer: 'Jivdaya Charitable Trust',
      category: 'Animal Welfare',
      date: '2024-02-25',
      time: '11:00 AM',
      location: 'Animal Shelter, Whitefield',
      distance: '8.5 km',
      attendees: 67,
      status: 'upcoming',
      description: 'Join us for a day of awareness and care for stray animals. Donations welcome.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Events & Drives</h1>
          <p className="text-gray-600">Join community events and donation drives near you.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {['upcoming', 'past', 'all'].map((filterOption) => (
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

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
          >
            {/* Image */}
            <div className="relative h-48 bg-gray-100 overflow-hidden">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 right-3">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  event.status === 'upcoming' 
                    ? 'bg-emerald-50 text-emerald-600' 
                    : 'bg-gray-50 text-gray-600'
                }`}>
                  {event.status === 'upcoming' ? 'Upcoming' : 'Past Event'}
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/70 text-white px-3 py-1 rounded-lg text-xs font-bold tracking-wide uppercase">
                {event.category}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {event.title}
              </h3>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="flex-1 truncate">{event.location}</span>
                  <span className="text-xs text-emerald-600 font-medium">{event.distance}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{event.attendees} attending</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="text-gray-500">Organized by</span>
                  <span className="font-semibold text-gray-900 ml-1">{event.organizer}</span>
                </div>
                {event.status === 'upcoming' && (
                  <button className="px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                    Join Event
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
          <p className="text-gray-600">Check back later for upcoming events and drives.</p>
        </div>
      )}
    </div>
  );
};

export default EventsDrives;
