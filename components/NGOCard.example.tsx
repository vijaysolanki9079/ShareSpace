"use client";

import React, { useState } from 'react';
import DonateModal from './DonateModal';

interface NGOInfo {
  id: string;
  organizationName: string;
  mission?: string;
  location?: string;
  distanceKm?: number;
}

export default function NGOCardExample({ ngo }: { ngo?: NGOInfo }) {
  const sample: NGOInfo = ngo ?? {
    id: 'demo-ngo-1',
    organizationName: 'Demo NGO',
    mission: 'Providing education and healthcare support to underserved communities.',
    location: 'Delhi, India',
    distanceKm: 3.2,
  };

  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-md rounded-xl bg-white/5 p-4 text-white shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{sample.organizationName}</h3>
          <p className="text-sm text-white/80 mt-1">{sample.mission}</p>
          <div className="text-xs text-white/60 mt-2">{sample.location} • {sample.distanceKm?.toFixed(1)} km</div>
        </div>

        <div className="ml-4 flex flex-col gap-2">
          <button
            onClick={() => setOpen(true)}
            className="px-3 py-1 rounded bg-emerald-500 text-white font-medium"
          >
            Donate
          </button>
          <a href={`/explore?ngo=${encodeURIComponent(sample.id)}`} className="text-xs text-white/70 hover:underline">
            View
          </a>
        </div>
      </div>

      <DonateModal isOpen={open} onClose={() => setOpen(false)} ngo={sample} />
    </div>
  );
}
