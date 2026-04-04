'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import DashboardClient from "@/components/dashboard/DashboardClient";

export default function DashboardPage() {
  return (
    <ProtectedRoute requiredType="user">
      <DashboardClient />
    </ProtectedRoute>
  );
}

