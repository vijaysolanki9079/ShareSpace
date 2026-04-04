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
      description:
        'Collecting jackets, blankets, and warm clothes for the homeless community.',
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
      description:
        'Help underprivileged kids start the year right. We need backpacks, notebooks, and pens.',
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
      description: 'Non-perishable food for the Downtown Community Pantry.',
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
      description: 'Awareness and care for stray animals. Donations welcome.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1000&auto=format&fit=crop',
    },
  ];

  const filteredEvents = filter === 'all' ? events : events.filter((e) => e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">Events & drives</h2>
          <p className="mt-1 text-sm text-slate-300">Join community events near you</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['upcoming', 'past', 'all'].map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            onClick={() => setFilter(filterOption)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all ${
              filter === filterOption
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'border border-zinc-200 bg-white text-zinc-600 hover:border-emerald-300 hover:text-emerald-800'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredEvents.map((event) => (
          <article
            key={event.id}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-sm transition-all hover:border-white/20 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none transition-opacity duration-500 group-hover:bg-slate-950/20" />
              <div className="absolute right-3 top-3">
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    event.status === 'upcoming'
                      ? 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/80'
                      : 'bg-slate-800 text-zinc-600'
                  }`}
                >
                  {event.status === 'upcoming' ? 'Upcoming' : 'Past'}
                </span>
              </div>
              <div className="absolute bottom-3 left-3 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur-md z-10">
                {event.category}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-semibold text-slate-100 transition-colors group-hover:text-emerald-800">
                {event.title}
              </h3>
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-400">{event.description}</p>

              <ul className="mb-4 mt-4 space-y-2 border-t border-zinc-100 pt-4 text-sm text-zinc-600">
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-zinc-400" />
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4 shrink-0 text-zinc-400" />
                  {event.time}
                </li>
                <li className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <MapPin className="h-4 w-4 shrink-0 text-zinc-400" />
                  <span className="min-w-0 flex-1 truncate">{event.location}</span>
                  <span className="text-xs font-semibold text-emerald-700">{event.distance}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Users className="h-4 w-4 shrink-0 text-zinc-400" />
                  {event.attendees} attending
                </li>
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                <p className="text-sm text-slate-400">
                  By <span className="font-semibold text-slate-200">{event.organizer}</span>
                </p>
                {event.status === 'upcoming' && (
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    Join event
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5/80 py-14 text-center">
          <Calendar className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
          <h3 className="text-lg font-semibold text-slate-100">No events found</h3>
          <p className="mt-1 text-sm text-slate-300">Try another filter or check back later.</p>
        </div>
      )}
    </div>
  );
};

export default EventsDrives;
