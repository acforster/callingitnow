import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import Navigation from '@/components/Navigation';
import { SettingsProvider } from '@/lib/SettingsContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CallingItNow - Make Your Predictions',
  description: 'A platform for recording and tracking predictions about future events',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <SettingsProvider>
            <div className="min-h-screen bg-gray-50">
              <Navigation />
              <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </main>
            </div>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
