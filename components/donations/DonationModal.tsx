"use client";

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Calendar, Mail, MessageCircle, Package, Phone, User, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { formatShortDate } from '@/lib/random-display';

export type DonationContactTarget =
  | {
      type: 'item';
      id: string;
      title: string;
      description: string | null;
      category: string;
      image: string | null;
      createdAt: string;
      listedOn?: Date;
      neededBy?: Date;
      displayCondition?: string;
      displayDonationType?: string;
      donor: {
        id: string;
        fullName: string;
        email?: string | null;
        image?: string | null;
      };
      ngo?: {
        id: string;
        organizationName: string;
        image?: string | null;
      } | null;
    }
  | {
      type: 'ngo';
      id: string;
      organizationName: string;
      missionArea?: string | null;
      categories?: string[];
      image?: string | null;
      locationName?: string | null;
      isVerified?: boolean;
    };

interface DonationModalProps {
  target: DonationContactTarget | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DonationModal({ target, isOpen, onClose }: DonationModalProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [creatingChat, setCreatingChat] = useState(false);

  if (!target) return null;

  const isItem = target.type === 'item';
  const title = isItem ? target.title : target.organizationName;
  const recipientId = isItem ? target.donor.id : target.id;
  const recipientName = isItem ? target.donor.fullName : target.organizationName;
  const recipientType = isItem ? 'Donor' : 'NGO';
  const image = isItem ? target.image : target.image || null;

  const handleChat = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setShowLoginPrompt(true);
      return;
    }

    if (recipientId === session.user.id) {
      toast('This belongs to your account.');
      return;
    }

    setCreatingChat(true);
    try {
      const resp = await fetch('/api/chat/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participants: [recipientId],
          title: isItem ? `Donation item: ${target.title}` : `Support inquiry: ${target.organizationName}`,
        }),
      });
      const payload = await resp.json().catch(() => null);
      if (!resp.ok) throw new Error(payload?.error || 'Could not start chat');
      router.push(`/dashboard?section=messages&chatId=${payload?.conversation?.id}`);
      onClose();
    } catch (err) {
      console.error('chat create error', err);
      toast.error(err instanceof Error ? err.message : 'Failed to start chat');
    } finally {
      setCreatingChat(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.22 }}
            className="fixed left-1/2 top-1/2 z-[110] flex max-h-[calc(100vh-2rem)] w-[min(860px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.45)] sm:max-h-[88vh] lg:min-h-[540px]"
          >
            <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[0.82fr_1.18fr] lg:grid-rows-1">
              <div className="bg-emerald-950 p-4 text-white lg:min-h-0 lg:overflow-hidden">
                <div className="relative h-40 overflow-hidden rounded-[1.35rem] bg-emerald-900 sm:h-48 lg:h-full">
                  {image ? (
                    <img src={image} alt={title} className="h-full w-full object-cover opacity-80" />
                  ) : (
                    <div className="grid h-full place-items-center bg-emerald-900">
                      {isItem ? <Package size={72} className="text-emerald-300" /> : <Building2 size={72} className="text-emerald-300" />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <span className="rounded-full border border-white/15 bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur">
                      {isItem ? target.category : target.isVerified ? 'Verified NGO' : 'NGO'}
                    </span>
                    <h2 className="mt-3 line-clamp-2 text-xl font-black leading-tight tracking-tight sm:text-2xl">{title}</h2>
                  </div>
                </div>
              </div>

              <div className="flex min-h-0 flex-col overflow-hidden">
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-100 p-5 sm:p-6">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
                      Contact {recipientType}
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-500">
                      Review the details and start a chat when you are ready.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
                  <div className="rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                        {isItem ? <User size={20} /> : <Building2 size={20} />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-gray-950">{recipientName}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-gray-400">{recipientType}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Info label={isItem ? 'What is offered' : 'Main focus'} value={isItem ? target.category : target.missionArea || 'Community support'} />
                    <Info
                      label={isItem ? 'Listed on' : 'Location'}
                      value={isItem ? formatShortDate(target.listedOn || new Date(target.createdAt)) : target.locationName || 'Not specified'}
                      icon={isItem ? <Calendar size={15} /> : undefined}
                    />
                  </div>

                  <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-sm font-black text-emerald-950">
                      {isItem ? 'Item details' : 'How you can help'}
                    </p>
                    <p className="mt-2 max-h-32 overflow-y-auto pr-1 text-sm font-medium leading-6 text-emerald-900/75">
                      {isItem
                        ? target.description || 'The donor has listed this item for someone who can put it to good use.'
                        : `This organization works around ${target.missionArea || 'community needs'}. You can contact them to donate items, coordinate support, or ask what they currently need.`}
                    </p>
                    {isItem && (
                      <p className="mt-3 rounded-2xl bg-white px-3 py-2 text-xs font-black uppercase tracking-wide text-emerald-700">
                        {target.displayCondition || 'Good condition'} • {target.displayDonationType || 'Ready to collect'} • Needed by {formatShortDate(target.neededBy || new Date(target.createdAt))}
                      </p>
                    )}
                    {!isItem && target.categories && target.categories.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {target.categories.slice(0, 5).map((category) => (
                          <span key={category} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-[1.25rem] border border-gray-100 bg-white p-4 shadow-sm">
                    <p className="text-sm font-black text-gray-950">Suggested message</p>
                    <p className="mt-2 max-h-28 overflow-y-auto rounded-2xl bg-gray-50 p-3 pr-4 text-sm font-medium leading-6 text-gray-600">
                      {isItem
                        ? `Hi ${recipientName}, I saw your donation item "${target.title}" on ShareSpace. Is it still available?`
                        : `Hi ${recipientName}, I would like to donate or support your current needs through ShareSpace.`}
                    </p>
                  </div>

                  {showLoginPrompt && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm font-semibold text-amber-800">
                      Please log in to start a secure chat.
                    </div>
                  )}
                </div>

                <div className="shrink-0 border-t border-gray-100 bg-white p-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <button
                      onClick={handleChat}
                      disabled={creatingChat}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(5,150,105,0.9)] hover:bg-emerald-700 disabled:bg-gray-300"
                    >
                      <MessageCircle size={18} />
                      {creatingChat ? 'Starting...' : 'Start Chat'}
                    </button>
                    {isItem && target.donor.email && (
                      <a
                        href={`mailto:${target.donor.email}`}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 hover:bg-gray-50"
                      >
                        <Mail size={18} />
                        Email
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => toast.success('Contact request noted. Use chat for secure coordination.')}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Phone size={18} />
                      Contact
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 flex items-center gap-2 text-sm font-bold text-gray-900">
        {icon}
        {value}
      </p>
    </div>
  );
}
