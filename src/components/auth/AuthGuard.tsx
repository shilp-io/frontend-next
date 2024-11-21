'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireVerified?: boolean;
}

export function AuthGuard({
  children,
  requireAdmin = false,
  requireVerified = false,
}: ProtectedRouteProps) {
  const { user, userData, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (requireVerified && user && !user.emailVerified) {
      router.push('/verify-email');
      return;
    }

    if (requireAdmin && userData?.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, userData, isLoading, requireAdmin, requireVerified]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
