'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { predictionsAPI, Prediction } from '@/lib/api';
import { format } from 'date-fns';

export default function PredictionPage() {
  const params = useParams();
  const id = params.id as string;
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchPrediction = async () => {
        try {
          setLoading(true);
          const data = await predictionsAPI.getById(parseInt(id, 10));
          setPrediction(data);
        } catch (err) {
          setError('Failed to load prediction. It may be private or may not exist.');
        } finally {
          setLoading(false);
        }
      };
      fetchPrediction();
    }
  }, [id]);

  if (loading) {
    return <div className="text-center py-10">Loading prediction...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  if (!prediction) {
    return <div className="text-center py-10">Prediction not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold leading-6 text-gray-900">{prediction.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Called by @{prediction.user.handle} on {format(new Date(prediction.timestamp), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="px-4 py-5 sm:p-6">
          <div className="text-gray-700 whitespace-pre-wrap">
            {prediction.content}
          </div>
        </div>
        <div className="px-4 py-4 sm:px-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Category: <span className="font-medium text-gray-900">{prediction.category}</span>
            </div>
            <div className="text-sm text-gray-600">
              Visibility: <span className="font-medium text-gray-900">{prediction.visibility}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
