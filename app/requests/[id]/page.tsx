'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SiteChrome from '@/components/SiteChrome';
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

export default function RequestDetailPage() {
  const params = useParams();
  const requestId = params.id as string;
  const { data: session } = useSession();
  const router = useRouter();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messaging, setMessaging] = useState(false);

  const startConversation = trpc.chat.startConversation.useMutation();

  useEffect(() => {
    fetchRequestDetail();
  }, [requestId]);

  const fetchRequestDetail = async () => {
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
  };

  const handleStartChat = async () => {
    if (!session?.user?.id) {
      alert('Please log in to message');
      return;
    }

    setMessaging(true);
    try {
      // Get current location if possible for proximity share
      let locationParams = '';
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        locationParams = `&shareLocation=true&lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`;
      } catch (e) {
        console.warn('Location access denied or timed out');
      }

      // Create conversation via tRPC chat router (Prisma-backed)
      const conv = await startConversation.mutateAsync({
        targetId: request.requester.id,
        targetType: 'user', // ItemRequest requester is always a User
      });

      // Redirect to the dashboard messages section with this chat selected
      router.push(`/dashboard?section=messages&chatId=${conv.id}${locationParams}`);
    } catch (err) {
      console.error(err);
      alert('Failed to start conversation');
      setMessaging(false);
    }
  };

  if (loading) {
    return (
      <SiteChrome>
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="animate-spin text-blue-500" size={40} />
        </div>
      </SiteChrome>
    );
  }

  if (error || !request) {
    return (
      <SiteChrome>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg flex items-center gap-4">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <p className="font-medium text-red-900">{error}</p>
            </div>
          </div>
        </div>
      </SiteChrome>
    );
  }

  return (
    <SiteChrome>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-50 min-h-screen py-8"
      >
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Main content card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Image gallery */}
            {request.images && request.images.length > 0 ? (
              <div className="relative w-full h-96 bg-gray-200">
                <Image
                  src={request.images[0]}
                  alt={request.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            ) : (
              <div className="w-full h-96 bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                <span className="text-white text-lg">No image available</span>
              </div>
            )}

            {/* Content */}
            <div className="p-8">
              {/* Category badge */}
              <div className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full mb-4">
                {request.category.name}
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {request.title}
              </h1>

              {/* Status and date */}
              <div className="flex gap-6 mb-6 pb-6 border-b">
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="text-lg font-medium text-green-600">
                    {request.status === 'open' ? '🟢 Open' : 'Closed'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="text-lg font-medium">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {request.description}
                </p>
              </div>

              {/* Location info */}
              <div className="bg-blue-50 p-6 rounded-lg mb-8">
                <div className="flex items-start gap-4">
                  <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-1">Location</h3>
                    <p className="text-gray-700">{request.locationName || 'Not specified'}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Coordinates: {request.latitude.toFixed(4)},{' '}
                      {request.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={handleStartChat}
                  disabled={!session?.user?.id || messaging}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  {messaging ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageCircle size={20} />
                      Offer Help
                    </>
                  )}
                </button>
                <button className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors">
                  <Heart size={20} />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Requester card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              About the Requester
            </h2>

            <div className="flex items-center gap-6">
              {request.requester.image && (
                <Image
                  src={request.requester.image}
                  alt={request.requester.fullName}
                  width={100}
                  height={100}
                  className="w-20 h-20 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">
                  {request.requester.fullName}
                </h3>
                <p className="text-gray-600 mt-1">
                  {request.requester.bio || 'No bio available'}
                </p>
              </div>
            </div>
          </div>

          {/* Responses section */}
          {request.responses && request.responses.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Users size={24} />
                Interested Helpers ({request.responses.length})
              </h2>

              <div className="space-y-4">
                {request.responses.map((response: any) => (
                  <div key={response.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    {response.donor.image && (
                      <Image
                        src={response.donor.image}
                        alt={response.donor.fullName}
                        width={50}
                        height={50}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {response.donor.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        Offered to help{' '}
                        {new Date(response.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </SiteChrome>
  );
}
