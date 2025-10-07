import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import logoAlpher from '@/public/logoalpher.png'; // Import the image directly

interface AuthLayoutProps {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-brand-background">
      <div className="flex flex-1">
        {/* Left Column: Branding */}
        <div className="relative hidden w-0 flex-1 lg:block">
          <div className="flex h-full flex-col justify-center items-center p-12 bg-primary-700 text-white">
            <Link href="/" className="flex flex-col items-center space-y-4">
                <Image src={logoAlpher} alt="CallingItNow Character Logo" width={128} height={128} unoptimized />
                <span className="text-3xl font-bold">CallingItNow</span>
            </Link>
            <p className="mt-6 text-lg text-primary-100">Make your predictions. Settle the score.</p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm-px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">
                {title}
              </h2>
              <div className="mt-2 text-sm text-gray-600">
                {subtitle}
              </div>
            </div>

            <div className="mt-8">
              <div>
                {children}
              </div>
            </div>
             <div className="mt-6 text-center">
                <Link href="/" className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    ← Back to home
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}