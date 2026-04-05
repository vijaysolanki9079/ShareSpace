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
      condition: 'Good condition',
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
      condition: 'Like new',
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

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { text: string; bg: string; textColor: string; icon: any }> = {
      approved: { text: 'Approved', bg: 'bg-emerald-50', textColor: 'text-emerald-800', icon: CheckCircle2 },
      pending: { text: 'Pending', bg: 'bg-amber-50', textColor: 'text-amber-800', icon: Clock },
      completed: { text: 'Completed', bg: 'bg-slate-800', textColor: 'text-slate-200', icon: CheckCircle2 },
      rejected: { text: 'Rejected', bg: 'bg-red-50', textColor: 'text-red-700', icon: XCircle },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">My requests</h2>
          <p className="mt-1 text-sm text-slate-300">Items you have asked for from donors nearby</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          Browse items
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'pending', 'approved', 'completed', 'rejected'].map((filterOption) => (
          <button
            key={filterOption}
            type="button"
            onClick={() => setFilter(filterOption)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all ${
              filter === filterOption
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filteredRequests.map((request) => {
          const statusBadge = getStatusBadge(request.status);
          const StatusIcon = statusBadge.icon;

          return (
            <article
              key={request.id}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-white/20 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-800">
                <img
                  src={request.image}
                  alt={request.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none transition-opacity duration-500 group-hover:bg-slate-950/20" />
                <div className="absolute right-3 top-3">
                  <div
                    className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge.bg} ${statusBadge.textColor}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {statusBadge.text}
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur-md z-10">
                  {request.category}
                </div>
                <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-200 backdrop-blur-sm">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                  {request.distance}
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-base font-semibold text-slate-100 transition-colors group-hover:text-emerald-400">
                  {request.title}
                </h3>
                <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {request.condition}
                </p>

                <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3">
                  <div className="flex items-center gap-2 text-[13px] text-zinc-400">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium text-slate-200">{request.donor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(request.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg bg-emerald-500/20 py-2 text-[13px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/30 ring-1 ring-emerald-500/30"
                    >
                      View details
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-white/10 px-3 py-2 text-zinc-400 transition-colors hover:border-emerald-400/50 hover:bg-emerald-500/10 hover:text-emerald-300"
                      aria-label="Message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
                {request.status === 'approved' && (
                  <button
                    type="button"
                    className="mt-4 w-full rounded-lg bg-emerald-600/20 py-2 text-[13px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40 transition-colors hover:bg-emerald-500/30"
                  >
                    Arrange pickup
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {filteredRequests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5/80 py-14 text-center">
          <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
          <h3 className="text-lg font-semibold text-slate-100">No requests found</h3>
          <p className="mt-1 text-sm text-slate-300">Try another filter or browse available items.</p>
          <button
            type="button"
            className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Browse available items
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
