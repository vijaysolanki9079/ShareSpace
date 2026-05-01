/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { ShoppingBag, CheckCircle2, Clock, XCircle, MapPin, User, MessageCircle } from 'lucide-react';

interface MyRequestsProps {
  mode?: 'user' | 'ngo';
}

import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';

const MyRequests = ({ mode = 'user' }: MyRequestsProps) => {
  const [filter, setFilter] = useState('all');
  
  const { data: session } = useSession();
  const userId = session?.user?.id as string;
  
  const { data: fetchedRequests, isLoading, refetch } = trpc.item.getMyRequests.useQuery(
    { userId },
    { enabled: !!userId && mode === 'user' }
  );

  const requests = fetchedRequests || [];

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
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            {mode === 'ngo' ? 'Community requests' : 'My requests'}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {mode === 'ngo'
              ? 'Requests your NGO is reviewing or fulfilling'
              : 'Items you have asked for from donors nearby'}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          {mode === 'ngo' ? 'Review intake' : 'Browse items'}
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

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[300px] rounded-xl bg-white/5 animate-pulse border border-white/10" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRequests.map((request) => {
            const statusBadge = getStatusBadge(request.status);
            const StatusIcon = statusBadge.icon;

            return (
              <article
                key={request.id}
                className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-white/20 hover:shadow-md"
              >
                <div className="relative aspect-[2/1] overflow-hidden bg-slate-800">
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
                      <StatusIcon className="h-3.5 w-3.5" strokeWidth={1.75} />
                      {statusBadge.text}
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-lg bg-zinc-950/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-200 backdrop-blur-md z-10">
                    {request.category}
                  </div>
                  <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full border border-white/20 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm shadow-sm">
                    <MapPin className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
                    {request.distance}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-semibold text-slate-100 transition-colors group-hover:text-emerald-400">
                    {request.title}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-2 text-[13px] text-slate-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {request.condition}
                  </p>

                  <div className="mt-2 space-y-1.5 border-t border-white/10 pt-2">
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
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="flex-1 rounded-lg bg-emerald-500/20 py-1.5 text-[13px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/30 ring-1 ring-emerald-500/30"
                      >
                        {mode === 'ngo' ? 'Open request' : 'View details'}
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
                      className="mt-3 w-full rounded-lg bg-emerald-600/20 py-1.5 text-[13px] font-semibold text-emerald-300 ring-1 ring-emerald-500/40 transition-colors hover:bg-emerald-500/30"
                    >
                      {mode === 'ngo' ? 'Assign delivery' : 'Arrange pickup'}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filteredRequests.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/5/80 py-14 text-center">
          <ShoppingBag className="mx-auto mb-4 h-14 w-14 text-zinc-300" />
          <h3 className="text-lg font-semibold text-slate-100">No requests found</h3>
          <p className="mt-1 text-sm text-slate-300">
            {mode === 'ngo'
              ? 'Try another filter or check for new community submissions.'
              : 'Try another filter or browse available items.'}
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-6 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Refresh List
          </button>
        </div>
      )}
    </div>
  );
};

export default MyRequests;
