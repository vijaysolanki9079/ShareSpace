'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { trpc } from '@/lib/trpc';
import {
  AlertCircle,
  Calendar,
  Flag,
  Loader,
  MapPin,
  MessageCircle,
  Phone,
  X,
} from 'lucide-react';
import Image from 'next/image';
import ImageCarousel from './ImageCarousel';
import VerifiedBadge from './VerifiedBadge';
import { toast } from 'react-hot-toast';

interface DonationDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: {
    id: string;
    title: string;
    description: string;
    images: string[];
    status: string;
    category: {
      id: string;
      name: string;
    };
    locationName: string | null;
    latitude: number;
    longitude: number;
    radius: number;
    distance?: number;
    requester: {
      id: string;
      fullName: string;
      image: string | null;
      bio?: string;
      isVerified?: boolean;
    };
    ngo?: {
      id: string;
      organizationName: string;
      image: string | null;
      isVerified: boolean;
    };
    createdAt: string;
  };
}

export default function DonationDetailModal({
  isOpen,
  onClose,
  request,
}: DonationDetailModalProps) {
  const { data: session } = useSession();
  const [contactSent, setContactSent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const startConversation = trpc.chat.startConversation.useMutation();
  const isOwnRequest = request.requester.id === session?.user?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [isOpen]);

  const handleStartChat = async () => {
    if (!session?.user?.id) {
      toast.error('Please log in to message');
      return;
    }
    if (isOwnRequest) {
      toast('This is your own request. You can manage it from your dashboard.');
      return;
    }

    setSubmitting(true);
    try {
      const conv = await startConversation.mutateAsync({
        targetId: request.requester.id,
        targetType: 'user',
        itemRequestId: request.id,
        initialMessage: `I can help with: ${request.title}`,
      });

      window.location.href = `/dashboard?section=messages&chatId=${conv.id}`;
    } catch (err) {
      console.error(err);
      toast.error('Failed to start conversation');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactClick = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/contact`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send notification');
      }

      setContactSent(true);
      setTimeout(() => setContactSent(false), 3000);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send notification');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Please enter a reason for reporting');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/requests/${request.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      });

      if (!response.ok) throw new Error('Failed to report');

      toast.success('Thank you for reporting. Our team will review this.');
      setReportOpen(false);
      setReportReason('');
    } catch {
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const statusBadgeClass =
    request.status === 'open'
      ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
      : request.status === 'fulfilled'
        ? 'border-sky-100 bg-sky-50 text-sky-700'
        : 'border-gray-200 bg-gray-100 text-gray-700';

  const distanceLabel =
    request.distance === undefined
      ? null
      : request.distance < 1000
        ? `${Math.round(request.distance)} m away`
        : `${(request.distance / 1000).toFixed(1)} km away`;

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed left-0 top-0 z-[1050] flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-slate-950/85 p-4 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 18 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
            className="relative z-[1100] flex max-h-[calc(100dvh-2rem)] w-[min(1040px,100%)] flex-col overflow-hidden rounded-[1.75rem] border border-white/70 bg-white shadow-[0_24px_70px_-30px_rgba(15,23,42,0.55)]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/60 px-5 py-3.5 backdrop-blur md:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-600">
                  Request detail
                </p>
                <h2 className="mt-1 truncate text-xl font-black tracking-tight text-gray-950 md:text-2xl">
                  {request.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="ml-4 grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gray-100 bg-gray-50 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.9fr)] lg:overflow-hidden">
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-4 md:p-5 lg:overflow-y-auto">
                <div className="overflow-hidden rounded-[1.5rem] border border-white bg-white p-2 shadow-sm">
                  <ImageCarousel images={request.images} title={request.title} />
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <InfoTile
                    label="Posted"
                    value={formatDate(request.createdAt)}
                    icon={<Calendar size={15} className="text-emerald-600" />}
                  />
                  <InfoTile label="Area" value={request.locationName || 'Location not specified'} />
                  <InfoTile label="Radius" value={`Within ${Math.round(request.radius / 1000)} km`} />
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                <div className="flex-1 space-y-4 overflow-y-auto p-5 md:p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-emerald-700">
                      {request.category?.name}
                    </span>
                    <span className={`rounded-full border px-3 py-1.5 text-[11px] font-black uppercase tracking-widest ${statusBadgeClass}`}>
                      {request.status === 'open' ? 'Open' : request.status}
                    </span>
                    {distanceLabel && (
                      <span className="rounded-full border border-gray-100 bg-gray-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-gray-600">
                        {distanceLabel}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Need</h3>
                    <p className="mt-2 whitespace-pre-wrap text-[15px] font-medium leading-7 text-gray-700">
                      {request.description}
                    </p>
                  </div>

                  <div className="rounded-[1.25rem] border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-600 shadow-sm">
                        <MapPin size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-950">Pickup / delivery area</p>
                        <p className="mt-1 text-sm font-medium leading-6 text-gray-600">
                          {request.locationName || 'Location not specified'}
                        </p>
                        <p className="mt-2 text-xs font-semibold text-gray-400">
                          Coordinates: {request.latitude.toFixed(3)}, {request.longitude.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <RequesterCard request={request} />

                  {request.ngo && (
                    <div className="rounded-[1.25rem] border border-emerald-100 bg-emerald-50 p-4">
                      <p className="mb-3 text-sm font-black text-emerald-950">Organization support</p>
                      <div className="flex items-center gap-3">
                        {request.ngo.image && (
                          <Image
                            src={request.ngo.image}
                            alt={request.ngo.organizationName}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-2xl border border-white object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-black text-emerald-950">
                              {request.ngo.organizationName}
                            </p>
                            {request.ngo.isVerified && (
                              <VerifiedBadge isVerified type="ngo" showLabel={false} />
                            )}
                          </div>
                          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-emerald-700/70">
                            Verified NGO
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {reportOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="rounded-[1.25rem] border border-red-100 bg-red-50 p-4"
                    >
                      <div className="flex gap-2 text-red-800">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <p className="text-sm font-semibold">Tell us what looks wrong with this request.</p>
                      </div>
                      <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="Spam, inappropriate content, fake request..."
                        rows={3}
                        className="mt-3 w-full resize-none rounded-2xl border border-red-100 bg-white px-4 py-3 text-sm outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                        disabled={submitting}
                      />
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={handleReport}
                          disabled={submitting || !reportReason.trim()}
                          className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:bg-gray-300"
                        >
                          {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                        <button
                          onClick={() => {
                            setReportOpen(false);
                            setReportReason('');
                          }}
                          className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="border-t border-gray-100 bg-white p-4 md:p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto]">
                    <button
                      onClick={handleStartChat}
                      disabled={submitting || isOwnRequest}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-[0_14px_30px_-16px_rgba(5,150,105,0.9)] transition hover:bg-emerald-700 disabled:bg-gray-300 disabled:shadow-none"
                    >
                      <MessageCircle size={18} />
                      {isOwnRequest ? 'Your Request' : 'Offer Help'}
                    </button>
                    <button
                      onClick={handleContactClick}
                      disabled={submitting || contactSent}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-700 transition hover:bg-gray-50 disabled:text-gray-400"
                    >
                      {submitting ? (
                        <>
                          <Loader className="animate-spin" size={18} />
                          Sending
                        </>
                      ) : contactSent ? (
                        'Notified'
                      ) : (
                        <>
                          <Phone size={18} />
                          Notify
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setReportOpen(!reportOpen)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-black text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
                    >
                      <Flag size={18} />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return mounted ? createPortal(modal, document.body) : null;
}

function InfoTile({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-2 flex items-center gap-2 line-clamp-2 text-sm font-bold text-gray-900">
        {icon}
        {value}
      </p>
    </div>
  );
}

function RequesterCard({ request }: { request: DonationDetailModalProps['request'] }) {
  return (
    <div className="rounded-[1.25rem] border border-gray-100 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-black text-gray-950">Requester</p>
      <div className="flex items-center gap-3">
        {request.requester?.image ? (
          <Image
            src={request.requester.image}
            alt={request.requester.fullName}
            width={48}
            height={48}
            className="h-12 w-12 rounded-2xl border border-gray-100 object-cover"
          />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-base font-black text-emerald-700">
            {request.requester?.fullName?.charAt(0) || 'U'}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-black text-gray-950">
              {request.requester?.fullName}
            </p>
            {request.requester?.isVerified && (
              <VerifiedBadge isVerified type="user" showLabel={false} />
            )}
          </div>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
            Individual requester
          </p>
        </div>
      </div>
      {request.requester?.bio && (
        <p className="mt-3 text-sm leading-6 text-gray-600">{request.requester.bio}</p>
      )}
    </div>
  );
}
