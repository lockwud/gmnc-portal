import type { Metadata, Viewport } from "next";
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import "./globals.css";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
  metadataBase: new URL("https://getmyneurocare.org"),
  title: "GetMyNeurocare | Online Neurology Care & Brain Health Services",
  description: "GetMyNeurocare - Your trusted online neurology care platform. Connect with board-certified neurologists for expert brain health consultations, diagnosis, and treatment.",
  keywords: [
    "neurology care",
    "online neurology",
    "brain health",
    "neurologist consultation",
    "telemedicine neurology",
    "neurological disorders",
    "migraine treatment",
    "epilepsy care",
    "stroke prevention",
    "neurological counseling",
  ],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "GetMyNeurocare | Online Neurology Care & Brain Health Services",
    description: "Connect with board-certified neurologists for expert brain health consultations and treatment online.",
    url: "https://getmyneurocare.org",
    siteName: "GetMyNeurocare",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "GetMyNeurocare",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GetMyNeurocare | Online Neurology Care & Brain Health Services",
    description: "Connect with board-certified neurologists for expert brain health consultations online.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

import { AuthProvider } from "../lib/context/AuthContext";
import { UIProvider } from "../lib/context/UIContext";
import { LayoutProvider } from "../lib/context/LayoutContext";

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
      <body className="min-h-full w-full flex flex-col">
        <AuthProvider>
          <LayoutProvider>
            <UIProvider>
              {children}
            </UIProvider>
          </LayoutProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
