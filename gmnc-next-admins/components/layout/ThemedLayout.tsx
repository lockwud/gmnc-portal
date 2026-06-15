'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { useAuth } from '@/lib/context/AuthContext';

export default function ThemedLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return (
    <ThemeProvider userId={user?.id ?? null}>
      {children}
    </ThemeProvider>
  );
}