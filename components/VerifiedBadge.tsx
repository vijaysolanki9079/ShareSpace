'use client';

import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  isVerified: boolean;
  type?: 'user' | 'ngo';
  showLabel?: boolean;
}

export default function VerifiedBadge({
  isVerified,
  type = 'user',
  showLabel = true,
}: VerifiedBadgeProps) {
  if (!isVerified) {
    return null;
  }

  const label = type === 'ngo' ? 'Verified NGO' : 'Verified User';
  const color = type === 'ngo' ? 'text-green-600' : 'text-blue-600';

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <CheckCircle size={18} fill="currentColor" />
      {showLabel && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
