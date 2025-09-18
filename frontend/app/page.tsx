'use client';

import { useState, useEffect } from 'react';
import { predictionsAPI, Prediction, PredictionListResponse } from '@/lib/api';
import PredictionCard from '@/components/PredictionCard';
import PredictionFilters from '@/components/PredictionFilters';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: '',
    sort: 'recent' as 'recent' | 'popular' | 'controversial',
    page: 1,
  });
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const fetchPredictions = async (reset = false) => {
    try {
      setLoading(true);
      const response: PredictionListResponse = await predictionsAPI.list({
        category: filters.category || undefined,
        sort: filters.sort,
        page: reset ? 1 : filters.page,
        per_page: 20,
      });

      if (reset) {
        setPredictions(response.predictions);
      } else {
        setPredictions(prev => [...prev, ...response.predictions]);
      }

      setTotalCount(response.total);
      setHasMore(response.predictions.length === 20);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions(true);
  }, [filters.category, filters.sort]);

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setFilters(prev => ({ ...prev, page: prev.page + 1 }));
      fetchPredictions();
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="text-center py-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl text-white">
        <h1 className="text-4xl font-bold mb-4">
          Make Your Predictions Count
        </h1>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Record your predictions about future events, vote on others' calls, and build your wisdom level in the community.
        </p>
        <div className="flex justify-center space-x-4">
          <a href="/predictions/new" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Make Your First Call
          </a>
          <a href="/auth/register" className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
            Join the Community
          </a>
        </div>
      </div>

      {/* Filters */}
      <PredictionFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalCount={totalCount}
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={() => fetchPredictions(true)}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      )}

      {/* Predictions Feed */}
      <div className="space-y-6">
        {predictions.map((prediction) => (
          <PredictionCard
            key={prediction.prediction_id}
            prediction={prediction}
            onUpdate={() => fetchPredictions(true)}
          />
        ))}

        {/* Loading State */}
        {loading && predictions.length === 0 && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Empty State */}
        {!loading && predictions.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔮</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No predictions found
            </h3>
            <p className="text-gray-500 mb-6">
              {filters.category
                ? `No predictions in the "${filters.category}" category yet.`
                : 'Be the first to make a prediction!'}
            </p>
            <a href="/predictions/new" className="btn-primary">
              Make a Prediction
            </a>
          </div>
        )}

        {/* Load More Button */}
        {!loading && hasMore && predictions.length > 0 && (
          <div className="text-center">
            <button
              onClick={loadMore}
              className="btn-outline"
            >
              Load More Predictions
            </button>
          </div>
        )}

        {/* End of Results */}
        {!loading && !hasMore && predictions.length > 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              You've reached the end of the predictions feed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
