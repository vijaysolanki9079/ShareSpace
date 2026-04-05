'use client';

import React from 'react';
import { MapPin, BadgeCheck, Star, ArrowRight } from 'lucide-react';

const NearbyNGOs = () => {
  const ngos = [
    {
      id: 1,
      name: 'Annapoorna Food Relief',
      category: 'Food',
      rating: 4.9,
      dist: '2.5 km',
      img: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
    },
    {
      id: 2,
      name: 'Jivdaya Trust',
      category: 'Animals',
      rating: 4.8,
      dist: '5.0 km',
      img: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    },
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">Nearby NGOs</h2>
          <p className="mt-1 text-sm text-slate-300">Verified organizations close to you</p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ngos.map((ngo) => (
          <article
            key={ngo.id}
            className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-4 shadow-sm transition-all hover:border-white/20 hover:shadow-md sm:p-5"
          >
            <div className="relative mb-5 aspect-[16/10] overflow-hidden rounded-xl bg-slate-800">
              <img
                src={ngo.img}
                alt=""
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none transition-opacity duration-500 group-hover:bg-slate-950/20" />
              <div className="absolute -bottom-3 right-4 rounded-xl border border-zinc-100 bg-white p-2.5 shadow-md">
                <BadgeCheck className="h-6 w-6 text-emerald-600" strokeWidth={2} />
              </div>
            </div>
            <div className="px-1 pb-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  {ngo.category}
                </span>
                <div className="flex items-center gap-1 text-slate-200">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold tabular-nums">{ngo.rating}</span>
                </div>
              </div>
              <h3 className="mb-4 text-lg font-semibold text-slate-100">{ngo.name}</h3>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  <span>{ngo.dist} away</span>
                </div>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white transition-transform hover:scale-105 hover:bg-zinc-800"
                  aria-label={`View ${ngo.name}`}
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default NearbyNGOs;
