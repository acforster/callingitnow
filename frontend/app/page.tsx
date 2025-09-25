{{ ... }}
import { useState, useEffect } from 'react';
import { predictionsAPI, Prediction, PredictionListResponse, getAuthToken } from '@/lib/api';
import PredictionCard from '@/components/PredictionCard';
{{ ... }}
  const [totalCount, setTotalCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!getAuthToken());
  }, []);

  const fetchPredictions = async (reset = false) => {
    try {
{{ ... }}
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {!isLoggedIn && (
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
      )}

      {/* Filters */}
      <PredictionFilters
{{ ... }}
