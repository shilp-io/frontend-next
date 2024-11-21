// src/app/dashboard/page.tsx
'use client';

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
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p>Welcome {userData?.displayName || 'Guest'}!</p>
        <p className="mt-2 text-gray-600">
          {userData ? 'Access your projects and settings below.' : 'Please complete your profile to get started.'}
        </p>
      </div>
    </div>
  );
}