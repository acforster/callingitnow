'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { predictionsAPI, Prediction } from '@/lib/api';
import PredictionCard from '@/components/PredictionCard';

export default function MyPredictionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      const fetchMyPredictions = async () => {
        try {
          setLoading(true);
          const response = await predictionsAPI.list({ user_id: user.user_id, sort: 'recent' });
          setPredictions(response.predictions);
          setError(null);
        } catch (err) {
          setError('Failed to load your predictions. Please try again later.');
        } finally {
          setLoading(false);
        }
      };
      fetchMyPredictions();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading your predictions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Predictions</h1>
      {predictions.length > 0 ? (
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <PredictionCard key={prediction.prediction_id} prediction={prediction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-700">You haven't made any predictions yet.</h2>
          <p className="text-gray-500 mt-2">Why not make your first one now?</p>
        </div>
      )}
    </div>
  );
}