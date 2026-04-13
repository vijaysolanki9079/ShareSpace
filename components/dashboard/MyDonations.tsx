'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface MyDonationsProps {
  mode?: 'user' | 'ngo';
}

const userDonations = [
  {
    id: 1,
    title: 'Winter Jacket',
    category: 'Clothes',
    status: 'completed',
    date: 'Jan 15',
    img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300',
  },
  {
    id: 2,
    title: 'Study Desk',
    category: 'Furniture',
    status: 'pending',
    date: 'Jan 20',
    img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=300',
  },
];

const ngoDonations = [
  {
    id: 1,
    title: 'Winter Blanket Drive',
    category: 'Essentials',
    status: 'completed',
    date: 'Feb 04',
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=300',
  },
  {
    id: 2,
    title: 'School Supplies Batch',
    category: 'Education',
    status: 'pending',
    date: 'Feb 08',
    img: 'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=300',
  },
];

const MyDonations = ({ mode = 'user' }: MyDonationsProps) => {
  const donations = mode === 'ngo' ? ngoDonations : userDonations;
  const title = mode === 'ngo' ? 'Received donations' : 'My donations';
  const subtitle =
    mode === 'ngo'
      ? 'Donations currently assigned to your organization'
      : 'Items you have shared with your community';
  const buttonLabel = mode === 'ngo' ? '+ Review queue' : '+ New donation';

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          {buttonLabel}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {donations.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-white/20 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
              <img
                src={item.img}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="pointer-events-none absolute inset-0 bg-slate-950/40 transition-opacity duration-500 group-hover:bg-slate-950/20" />
              <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-slate-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 backdrop-blur-md">
                {item.category}
              </span>
            </div>
            <div className="p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-slate-100">{item.title}</h3>
                  <p className="mt-1 text-[13px] text-slate-400">{item.date}</p>
                </div>
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                    item.status === 'completed'
                      ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 shadow-md shadow-emerald-500/20'
                      : 'border-amber-500/30 bg-gradient-to-br from-amber-500/20 to-orange-500/10 text-amber-400 shadow-md shadow-amber-500/20'
                  }`}
                  title={item.status}
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <Clock className="h-4 w-4" strokeWidth={1.75} />
                  )}
                </div>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-emerald-500/10 py-2 text-[13px] font-semibold text-emerald-400 ring-1 ring-emerald-500/20 transition-colors hover:bg-emerald-500/20"
              >
                {mode === 'ngo' ? 'Review allocation' : 'View details'}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MyDonations;
