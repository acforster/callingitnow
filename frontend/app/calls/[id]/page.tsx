'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api, { Prediction } from '@/lib/api';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import CallCard from '@/components/CallCard';
import CommentSection from '@/components/CommentSection';

export default function CallDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const predictionId = parseInt(id, 10);

  const [call, setCall] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCall = async () => {
    if (!predictionId) return;
    // Don't set loading to true on refetch, just on initial load
    if (!call) setLoading(true); 
    try {
      // The backend endpoint for a single prediction is /predictions/{id}
      const response = await api.get(`/predictions/${predictionId}`);
      setCall(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load the prediction. It may not exist or you may not have permission to view it.');
      setCall(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (predictionId) {
      fetchCall();
    }
  }, [predictionId]);

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (error || !call) {
      return (
        <div className="text-center py-12 text-red-600 bg-brand-background rounded-lg shadow-sm p-4">
          <p>{error || 'Prediction not found.'}</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <CallCard call={call} onUpdate={fetchCall} />
        <CommentSection predictionId={call.prediction_id} />
      </div>
    );
  };

  return (
    <>
      <LeftSidebar />
      <div className="col-span-12 lg:col-span-6 order-2 lg:order-2">
        {renderMainContent()}
      </div>
      <RightSidebar>
        {/* Contextual sidebar content can go here if needed */}
      </RightSidebar>
    </>
  );
}