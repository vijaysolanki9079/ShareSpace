'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  MessageCircle,
  Loader,
  AlertCircle,
  Heart,
} from 'lucide-react';
import Image from 'next/image';

import { trpc } from '@/lib/trpc';
import { useRouter } from 'next/navigation';
import NoImageFallback from '@/components/NoImageFallback';
import { getRenderableImages, isRenderableImageSrc } from '@/lib/image-src';
import { toast } from 'react-hot-toast';

interface RequestDetail {
  id: string;
  title: string;
  description: string;
  images: string[];
  latitude: number;
  longitude: number;
  locationName: string | null;
  status: string;
  createdAt: string;
  category: {
    name: string;
  };
  requester: {
    id: string;
    fullName: string;
    image: string | null;
    bio: string | null;
  };
  responses: Array<{
    id: string;
    createdAt: string;
    donor: {
      fullName: string;
      image: string | null;
    };
  }>;
}

function getRequestImageOverride(request: RequestDetail) {
  const text = `${request.title} ${request.description} ${request.category?.name ?? ''}`.toLowerCase();

  if (text.includes('winter') && (text.includes('jacket') || text.includes('children'))) {
    return '/assets/winter jackets for children copy.png';
  }

  if (text.includes('shelter')) {
    return '/assets/sheltered-co-breathable.png';
  }

  return null;
}

function getRequestImages(request: RequestDetail) {
  const override = getRequestImageOverride(request);
  if (override) return [override];
  return getRenderableImages(request.images);
}

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  const startConversation = trpc.chat.startConversation.useMutation();

  const fetchRequestDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/requests/${requestId}`);

      if (!response.ok) {
        throw new Error('Request not found');
      }

      const data = await response.json();
      setRequest(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load request');
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    fetchRequestDetail();
  }, [fetchRequestDetail]);

  const handleStartChat = async () => {
    if (!session?.user?.id) {
      toast.error('Please sign in first to message the requester.');
      return;
    }

    if (!request) return;
    if (request.requester.id === session.user.id) {
      toast('This is your own request. You can manage it from your dashboard.');
      return;
    }

    setMessaging(true);
    try {
      // Create conversation via tRPC chat router (Prisma-backed)
      const conv = await startConversation.mutateAsync({
        targetId: request.requester.id,
        targetType: 'user', // ItemRequest requester is always a User
        itemRequestId: request.id,
        initialMessage: `I can help with: ${request.title}`,
      });

      // Redirect to the dashboard messages section with this chat selected
      router.push(`/dashboard?section=messages&chatId=${conv.id}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to start conversation');
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-slate-950">
        <Loader className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-slate-950 px-4 py-12">
        <div className="mx-auto max-w-4xl">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-4">
          <AlertCircle className="text-red-600" size={24} />
          <div>
            <p className="font-medium text-red-900">{error}</p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  const isOwnRequest = request.requester.id === session?.user?.id;
  const requestImages = getRequestImages(request);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[calc(100vh-72px)] w-full items-center bg-slate-950 px-4 py-8 text-white"
    >
      <div className="mx-auto grid w-full max-w-5xl grid-cols-1 items-center gap-4 lg:max-h-[min(660px,calc(100vh-2.5rem))] lg:grid-cols-[0.95fr_1.05fr] lg:overflow-hidden">
        <section className="relative min-h-[240px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl lg:h-[560px]">
          {requestImages.length ? (
            <img
              src={requestImages[0]}
              alt={request.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <NoImageFallback />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/10" />
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {request.category.name}
            </span>
            <span className="rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {request.status === 'open' ? 'Open request' : 'Closed'}
            </span>
          </div>
        </section>

        <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white text-slate-950 shadow-2xl lg:h-[560px]">
          <div className="border-b border-slate-100 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-600">
              Community request
            </p>
            <h1 className="mt-1.5 text-xl font-black leading-tight text-slate-950 sm:text-2xl">
              {request.title}
            </h1>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-slate-400">Posted</p>
                <p className="mt-0.5 text-sm font-bold text-slate-800">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-emerald-600">Helpers</p>
                <p className="mt-0.5 text-sm font-bold text-emerald-800">{request.responses?.length ?? 0} interested</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wide text-slate-500">Description</h2>
              <p className="mt-1.5 max-h-28 overflow-y-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                {request.description}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-emerald-600" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">{request.locationName || 'Location not specified'}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {request.latitude.toFixed(4)}, {request.longitude.toFixed(4)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center gap-3">
                {isRenderableImageSrc(request.requester.image) ? (
                  <Image
                    src={request.requester.image}
                    alt={request.requester.fullName}
                    width={42}
                    height={42}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {request.requester.fullName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-950">{request.requester.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{request.requester.bio || 'Requester on ShareSpace'}</p>
                </div>
              </div>
            </div>

            {request.responses?.length > 0 && (
              <div className="rounded-lg border border-slate-100 p-3">
                <h2 className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500">
                  <Users className="h-4 w-4" />
                  Interested helpers
                </h2>
                <div className="max-h-20 space-y-1.5 overflow-y-auto">
                  {request.responses.map((response) => (
                    <div key={response.id} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-1.5">
                      <span className="truncate text-sm font-semibold text-slate-800">{response.donor.fullName}</span>
                      <span className="shrink-0 text-xs text-slate-500">{new Date(response.createdAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-slate-100 p-4">
            <button
              onClick={handleStartChat}
              disabled={messaging || isOwnRequest}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-colors hover:bg-emerald-700 disabled:bg-slate-300"
            >
              {messaging ? <Loader className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              {isOwnRequest ? 'Your Request' : messaging ? 'Starting...' : 'Offer Help'}
            </button>
            <button className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50">
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
