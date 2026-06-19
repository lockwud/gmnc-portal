'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

export default function TelehealthSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/settings');
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-slate-500">Redirecting to settings...</p>
      </div>
    </ProtectedRoute>
  );
}
