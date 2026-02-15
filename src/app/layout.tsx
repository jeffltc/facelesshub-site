import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'FacelessHub - Tools & Guides for Faceless Creators',
    template: '%s | FacelessHub',
  },
  description:
    'Free tools, in-depth guides, and a curated directory for faceless YouTube channel creators. Build a successful channel without showing your face.',
  metadataBase: new URL('https://facelesshub.com'),
  openGraph: {
    type: 'website',
    siteName: 'FacelessHub',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
