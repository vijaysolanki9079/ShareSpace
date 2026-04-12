'use client';

import NGODashboardView from '@/components/dashboard/NGODashboard';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function NGODashboardPage() {
  return (
    <ProtectedRoute requiredType="ngo">
      <NGODashboardView />
    </ProtectedRoute>
  );
}
