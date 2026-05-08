import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

import { AuthProvider } from '../lib/context/AuthContext';
import { UIProvider } from '../lib/context/UIContext';
import MainLayout from '@/components/layout/MainLayout';

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  title: 'GetMyNeurocare',
  description: 'GMNC dashboard',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons&display=swap"
        />
      </head>
      <body className="min-h-full w-full">
        <AuthProvider>
          <UIProvider>
            <MainLayout>{children}</MainLayout>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}