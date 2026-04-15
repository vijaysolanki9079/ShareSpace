"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface NGOInfo {
  id: string;
  organizationName: string;
  location?: string;
  phone?: string;
  mission?: string;
  distanceKm?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  ngo: NGOInfo | null;
}

export default function DonateModal({ isOpen, onClose, ngo }: Props) {
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  if (!isOpen || !ngo) return null;

  const handleLoginRedirect = () => {
    const returnTo = `/explore?ngo=${encodeURIComponent(ngo.id)}`;
    router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  };

  const handleChat = async () => {
    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      const resp = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: [ngo.id], title: `Chat with ${ngo.organizationName}` }),
      });
      const payload = await resp.json().catch(() => null);
      if (!resp.ok) {
        console.error('create conversation failed', payload);
        // fallback to deterministic conversation id for UX continuity
        const conversationId = [user.id, ngo.id].sort().join('_');
        router.push(`/dashboard/messages?conversation=${conversationId}&ngo=${ngo.id}`);
      } else {
        const convId = payload?.conversation?.id ?? ([user.id, ngo.id].sort().join('_'));
        router.push(`/dashboard/messages?conversation=${convId}&ngo=${ngo.id}`);
      }
      onClose();
    } catch (err) {
      console.error('chat create error', err);
      setShowLoginPrompt(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-2xl bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-2xl text-white"
      >
        <h3 className="text-2xl font-bold mb-2">Donate to {ngo.organizationName}</h3>
        <p className="text-sm text-white/80 mb-4">{ngo.mission}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <div className="text-xs text-white/70">Location</div>
            <div className="font-medium">{ngo.location ?? 'Not provided'}</div>
          </div>
          <div>
            <div className="text-xs text-white/70">Distance</div>
            <div className="font-medium">{ngo.distanceKm ? `${ngo.distanceKm.toFixed(1)} km` : '—'}</div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleChat}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 font-semibold"
          >
            Chat with NGO
          </button>

          <button
            onClick={() => {
              // placeholder for donate action; in a real flow we'd open donation form
              router.push(`/donations?ngo=${encodeURIComponent(ngo.id)}`);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 font-semibold"
          >
            Start Donation
          </button>
        </div>

        {showLoginPrompt && (
          <div className="mt-6 p-4 bg-red-600/10 border border-red-400/20 rounded-md">
            <div className="mb-2 font-semibold">Please log in to donate</div>
            <div className="flex gap-2">
              <button onClick={handleLoginRedirect} className="px-3 py-1 bg-emerald-500 rounded">Log in</button>
              <button onClick={() => setShowLoginPrompt(false)} className="px-3 py-1 border rounded">Cancel</button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
