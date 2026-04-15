'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageCircle,
  Phone,
  Flag,
  MapPin,
  Calendar,
  User,
  AlertCircle,
  Loader,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import ImageCarousel from './ImageCarousel';
import VerifiedBadge from './VerifiedBadge';

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
  const [contactSent, setContactSent] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleContactClick = async () => {
    setSubmitting(true);
    try {
      // TODO: Implement send contact notification
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setContactSent(true);
      setTimeout(() => setContactSent(false), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      alert('Please enter a reason for reporting');
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

      alert('Thank you for reporting. Our team will review this.');
      setReportOpen(false);
      setReportReason('');
    } catch (err) {
      alert('Failed to submit report');
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

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'fulfilled':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header with Close Button */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {request.title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Image Carousel */}
              <ImageCarousel images={request.images} title={request.title} />

              {/* Title & Status Row */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {request.title}
                    </h1>
                    <div className="flex gap-3 items-center flex-wrap">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {request.category?.name}
                      </span>
                      <span
                        className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusBadgeColor(
                          request.status
                        )}`}
                      >
                        {request.status === 'open'
                          ? '🟢 Available'
                          : request.status === 'fulfilled'
                          ? '✓ Claimed'
                          : '⊘ Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distance Badge */}
              {request.distance !== undefined && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800 font-medium">
                    📍 {Math.round(request.distance / 1000 * 10) / 10} km away
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </p>
              </div>

              {/* Location */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                <div className="flex gap-4 items-start">
                  <MapPin className="text-blue-600 flex-shrink-0 mt-1" size={24} />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">Location</h4>
                    <p className="text-gray-700 mb-2">
                      {request.locationName || 'Location not specified'}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      Coordinates: {request.latitude.toFixed(4)},{' '}
                      {request.longitude.toFixed(4)}
                    </p>
                    <p className="text-sm text-blue-700 font-medium">
                      📐 Within {request.radius / 1000} km radius
                    </p>
                  </div>
                </div>
              </div>

              {/* Posted Info */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Posted</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(request.createdAt)}
                  </p>
                </div>
              </div>

              {/* Requester Info */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  About the Requester
                </h3>
                <div className="flex gap-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
                  {request.requester?.image && (
                    <Image
                      src={request.requester.image}
                      alt={request.requester.fullName}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900">
                        {request.requester?.fullName}
                      </h4>
                      {request.requester?.isVerified && (
                        <VerifiedBadge
                          isVerified
                          type="user"
                          showLabel={false}
                        />
                      )}
                    </div>
                    {request.requester?.bio && (
                      <p className="text-sm text-gray-600">
                        {request.requester.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* NGO Info (if posted by NGO) */}
              {request.ngo && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Posted by Organization
                  </h3>
                  <div className="flex gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    {request.ngo.image && (
                      <Image
                        src={request.ngo.image}
                        alt={request.ngo.organizationName}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">
                          {request.ngo.organizationName}
                        </h4>
                        {request.ngo.isVerified && (
                          <VerifiedBadge
                            isVerified
                            type="ngo"
                            showLabel={false}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">NGO</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="border-t p-6 bg-gray-50 space-y-3">
              <div className="flex gap-3 flex-wrap">
                <Link
                  href={`/requests/${request.id}/chat`}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <MessageCircle size={20} />
                  💬 Chat Now
                </Link>

                <button
                  onClick={handleContactClick}
                  disabled={submitting || contactSent}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Sending...
                    </>
                  ) : contactSent ? (
                    <>✓ Notification Sent</>
                  ) : (
                    <>
                      <Phone size={20} />
                      📞 Contact
                    </>
                  )}
                </button>

                <button
                  onClick={() => setReportOpen(!reportOpen)}
                  className="flex-1 min-w-[200px] flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Flag size={20} />
                  🚩 Report
                </button>
              </div>

              {/* Report Form */}
              {reportOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg space-y-3"
                >
                  <div className="flex gap-2 items-start text-red-800">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <p className="text-sm">
                      Help us improve by reporting issues with this listing
                    </p>
                  </div>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Describe the issue (spam, inappropriate content, fake, etc.)"
                    rows={3}
                    className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                    disabled={submitting}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleReport}
                      disabled={submitting || !reportReason.trim()}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Report'}
                    </button>
                    <button
                      onClick={() => {
                        setReportOpen(false);
                        setReportReason('');
                      }}
                      className="flex-1 px-3 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
