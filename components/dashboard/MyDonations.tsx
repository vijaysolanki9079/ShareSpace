'use client';

import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const MyDonations = () => {
  const donations = [
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">My donations</h2>
          <p className="mt-1 text-sm text-slate-300">Items you have shared with your community</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          + New donation
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {donations.map((item) => (
          <article
            key={item.id}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-white/20 hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
              <img
                src={item.img}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none transition-opacity duration-500 group-hover:bg-slate-950/20" />
              <span className="absolute left-3 top-3 rounded-full bg-slate-950/80 border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-200 backdrop-blur-md z-10">
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
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    item.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}
                  title={item.status}
                >
                  {item.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <Clock className="h-4 w-4" strokeWidth={2} />
                  )}
                </div>
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-emerald-500/10 py-2 text-[13px] font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 ring-1 ring-emerald-500/20"
              >
                View details
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default MyDonations;
