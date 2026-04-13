'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import NGOPremiumDashboard from '@/components/dashboard/NGOPremiumDashboard';

export default function NGODashboardPage() {
  return (
    <ProtectedRoute requiredType="ngo">
      <NGOPremiumDashboard />
    </ProtectedRoute>
  );
}
