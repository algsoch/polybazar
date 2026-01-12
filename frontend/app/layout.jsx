import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PolyBazar — AI Intelligence for Polymer Trade',
  description: 'B2B marketplace for polymer granules and plastic waste trading with AI-powered pricing, visual classification, and intelligent negotiation.',
  keywords: 'polymer, granules, plastic waste, B2B, marketplace, recycling, sustainability',
  authors: [{ name: 'PolyBazar Team' }],
  openGraph: {
    title: 'PolyBazar — AI Intelligence for Polymer Trade',
    description: 'B2B marketplace for polymer granules and plastic waste trading',
    url: 'https://polybazar.com',
    siteName: 'PolyBazar',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PolyBazar - Polymer Trading Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PolyBazar — AI Intelligence for Polymer Trade',
    description: 'B2B marketplace for polymer granules and plastic waste trading',
    images: ['/og-image.png'],
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-neutral-bg`}>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#FFFFFF',
              color: '#374151',
              boxShadow: '0 8px 24px rgba(2, 6, 23, 0.1)',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#00BFA6',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <Sidebar />
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col lg:ml-20">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            
            {/* Footer */}
            <footer className="border-t border-neutral-border py-8 px-6">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-small text-neutral-muted">
                  © 2024 PolyBazar. All rights reserved.
                </div>
                <div className="flex items-center gap-6 text-small">
                  <a href="/privacy" className="text-neutral-muted hover:text-primary transition-colors">
                    Privacy Policy
                  </a>
                  <a href="/terms" className="text-neutral-muted hover:text-primary transition-colors">
                    Terms of Service
                  </a>
                  <a href="/contact" className="text-neutral-muted hover:text-primary transition-colors">
                    Contact
                  </a>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
