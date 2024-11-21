// src/app/dashboard/page.tsx
'use client';

import RequirementsManager from '@/components/document/Manager';
import { useUser } from '@/context/UserContext'
import React from 'react';

export default function DashboardPage() {
  const { userData, isLoading, error } = useUser();

  console.log(userData);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <p className="text-red-500">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RequirementsManager />
    </div>
  );
}
