// src/app/(dashboard)/layout.tsx

import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Atom } from 'lucide-react';
import ThemeToggle from '@/components/common/ThemeToggle';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'User dashboard page',
};

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: { children: React.ReactNode}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16">
        {children}
      </main>
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-gray-500 text-sm">© 2024 atoms.tech</p>
        </div>
      </footer>
    </div>
  );
};