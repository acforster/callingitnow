'use client';

import { useState, useEffect } from 'react';
import { predictionsAPI, Prediction } from '@/lib/api';
import CallCard from '@/components/CallCard';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'recent' | 'popular'>('popular');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await predictionsAPI.list({ sort: activeTab, page: 1, per_page: 20, safe_search: true });
        setPredictions(response.predictions);
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.detail || `Failed to load ${activeTab} calls`);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [activeTab]);

  const Tab = ({ tabName, title }: { tabName: 'recent' | 'popular', title: string }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-primary-600 text-white'
          : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {title}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-center border-b border-gray-200">
        <div className="flex space-x-2">
          <Tab tabName="popular" title="Popular Calls" />
          <Tab tabName="recent" title="Recent Calls" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">
          <p>{error}</p>
        </div>
      ) : predictions.length > 0 ? (
        <div className="space-y-6">
          {predictions.map((prediction) => (
            <CallCard key={prediction.prediction_id} call={prediction} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No calls found.</h3>
          <p className="text-gray-500">Be the first to make one!</p>
        </div>
      )}
    </div>
  );
}