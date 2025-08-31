import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import { Navigation } from '@/components/navigation';

// START: Claude Edit Boundary - Safe to modify layout structure and providers

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Code Review Assistant',
  description: 'Intelligent, automated code review and refactoring powered by AI',
  keywords: ['code review', 'AI', 'refactoring', 'development', 'automation'],
  authors: [{ name: 'AI Code Review Team' }],
  creator: 'AI Code Review Assistant',
  publisher: 'AI Code Review Assistant',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'AI Code Review Assistant',
    description: 'Intelligent, automated code review and refactoring powered by AI',
    siteName: 'AI Code Review Assistant',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Code Review Assistant',
    description: 'Intelligent, automated code review and refactoring powered by AI',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

// END: Claude Edit Boundary
