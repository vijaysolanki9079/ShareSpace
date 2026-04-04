'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import PremiumDashboard from '@/components/dashboard/PremiumDashboard';

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredType="user">
      <PremiumDashboard />
    </ProtectedRoute>
  );
}

