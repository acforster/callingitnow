'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900">@{user.handle}</h1>
              <p className="text-md text-gray-500 mt-2">{user.email}</p>
            </div>

            <div className="mt-10 border-t border-gray-200 pt-8">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1 text-center">
                  <dt className="text-sm font-medium text-gray-500">Wisdom Level</dt>
                  <dd className="mt-1 text-3xl font-semibold text-primary-600">{user.wisdom_level}</dd>
                </div>
                <div className="sm:col-span-1 text-center">
                  <dt className="text-sm font-medium text-gray-500">Predictions Made</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{user.prediction_count}</dd>
                </div>
                <div className="sm:col-span-2 text-center">
                  <dt className="text-sm font-medium text-gray-500">Predictions Backed</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{user.backing_count}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
              Member since {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}