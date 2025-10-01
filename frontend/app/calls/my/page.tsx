'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { predictionsAPI, Prediction } from '@/lib/api';
import CallCard from '@/components/CallCard';
import Link from 'next/link';

export default function MyCallsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMyCalls = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await predictionsAPI.list({ user_id: user.user_id });
      setPredictions(response.predictions);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load your calls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchMyCalls();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading your calls...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Calls</h1>
      {error && <p className="text-red-500">{error}</p>}
      {predictions.length > 0 ? (
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <CallCard key={prediction.prediction_id} call={prediction} onUpdate={fetchMyCalls} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">You haven't made any calls yet.</h2>
          <p className="text-gray-500 mt-2">Why not make your first one now?</p>
          <Link href="/predictions/new" className="mt-4 inline-block bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
            Make a Call
          </Link>
        </div>
      )}
    </div>
  );
}