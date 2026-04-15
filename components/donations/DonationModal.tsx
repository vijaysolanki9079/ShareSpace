"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Share2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Donation {
  id: number;
  name: string;
  amount?: number;
  cause: string;
  date: string;
  ngo?: string;
  // optional fields that may exist in real data
  donorId?: string;
  donorEmail?: string;
  donorPhone?: string;
  ngoId?: string;
}

interface DonationModalProps {
  donation: Donation | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ donation, isOpen, onClose }: DonationModalProps) {
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  if (!donation) return null;

  const handleChat = async () => {
    // recipient id must exist in real data; fallback for mock/demo data
    const recipientId = donation.donorId ?? donation.ngoId ?? null;
    if (!recipientId) {
      // Create a deterministic conversation id for demo items so UX testers can open chat
      const convId = `demo_item_${donation.id}`;
      router.push(`/dashboard/messages?conversation=${encodeURIComponent(convId)}&demo=true`);
      onClose();
      return;
    }

    const { data } = await supabase.auth.getUser();
    const user = data?.user ?? null;
    if (!user) {
      setShowLoginPrompt(true);
      return;
    }

    setCreatingChat(true);
    try {
      const resp = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: [recipientId], title: `Chat about ${donation.cause}` }),
      });
      const payload = await resp.json().catch(() => null);
      if (!resp.ok) {
        console.error('create conversation failed', payload);
        const conversationId = [user.id, recipientId].sort().join('_');
        router.push(`/dashboard/messages?conversation=${conversationId}`);
      } else {
        const convId = payload?.conversation?.id ?? ([user.id, recipientId].sort().join('_'));
        router.push(`/dashboard/messages?conversation=${convId}`);
      }
      onClose();
    } catch (err) {
      console.error('chat create error', err);
      setShowLoginPrompt(true);
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal (horizontal on md+) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24"
            onClick={onClose}
          >
            <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[75vh] overflow-hidden flex flex-col md:flex-row text-sm">
              {/* Left: icon + description */}
              <div className="flex-1 min-w-0 overflow-y-auto p-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-3xl shadow-md">
                      {donation.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{donation.name}</h2>
                      <p className="text-xs text-gray-500">
                        {new Date(donation.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="mt-6">
                  <motion.div animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block">
                    <Heart size={72} className="text-red-500 fill-red-500" />
                  </motion.div>
                </div>

                <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 p-6 rounded-xl border border-emerald-100">
                  <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wide mb-2">💚 Supported Cause</p>
                  <p className="text-lg font-bold text-gray-900 mb-4">{donation.cause}</p>
                  {donation.ngo && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <span className="font-semibold">Organization:</span>
                      <span className="text-emerald-700 font-bold">{donation.ngo}</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">💡 Your Impact</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Thank you for supporting <span className="font-semibold text-emerald-700">{donation.cause}</span>. Your action helps local groups deliver meaningful support.
                  </p>
                </div>

                {/* Donor moved to aside */}
              </div>

              {/* Right: donor card + contact/actions (Get in touch dropped below donor) */}
              <aside className="w-full md:w-80 flex-shrink-0 border-l border-gray-100 bg-white p-6 overflow-auto">
                <div>
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">👤 Donor</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                        {donation.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-base">{donation.name}</p>
                        <p className="text-sm text-gray-500">Community Helper</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm text-gray-600 font-semibold mb-2">Get in touch</h4>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={handleChat}
                        disabled={creatingChat}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                      >
                        <MessageCircle size={18} />
                        {creatingChat ? 'Starting chat...' : 'Chat with donor'}
                      </button>

                      <button
                        onClick={() => {
                          if (donation.donorEmail) {
                            window.location.href = `mailto:${donation.donorEmail}`;
                          } else if (donation.donorPhone) {
                            window.location.href = `tel:${donation.donorPhone}`;
                          } else {
                            alert('Contact details not available for this demo item.');
                          }
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                      >
                        Contact
                      </button>

                      <button
                        onClick={() => {
                          alert('Thanks — this report will be reviewed by moderators.');
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50"
                      >
                        Report item
                      </button>
                    </div>

                    {showLoginPrompt && (
                      <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded">
                        <p className="font-medium text-red-700 mb-2">Please log in to start a chat</p>
                        <div className="flex gap-2">
                          <button onClick={() => (window.location.href = `/login`)} className="px-3 py-1 bg-emerald-600 text-white rounded">Log in</button>
                          <button onClick={() => setShowLoginPrompt(false)} className="px-3 py-1 border rounded">Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
