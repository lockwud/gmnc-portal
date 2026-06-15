import type { Metadata, Viewport } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

import { AuthProvider } from '../lib/context/AuthContext';
import { UIProvider } from '../lib/context/UIContext';
import ThemedLayout from '../components/layout/ThemedLayout';

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
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="min-h-full w-full">
        <AuthProvider>
          <UIProvider>
            <ThemedLayout>{children}</ThemedLayout>
          </UIProvider>
        </AuthProvider>
      </body>
    </html>
  );
}