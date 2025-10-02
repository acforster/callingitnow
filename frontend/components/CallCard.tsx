'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api, { Prediction as Call } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth';
import CallCard from '@/components/CallCard';

// Define the Group types
interface GroupCreator {
  user_id: number;
  handle: string;
}

interface Group {
  group_id: number;
  name: string;
  description: string;
  visibility: 'public' | 'private' | 'secret';
  creator: GroupCreator;
  created_at: string;
  member_count: number;
  is_member?: boolean;
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.group_id as string;
  const { user } = useAuth();

  const [group, setGroup] = useState<Group | null>(null);
  const [predictions, setPredictions] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);

  const fetchGroupAndPredictions = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const [groupRes, predictionsRes] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get(`/groups/${groupId}/predictions`),
      ]);
      setGroup(groupRes.data);
      setPredictions(predictionsRes.data.predictions);
      setError(null);
    } catch (err) {
      setError('Failed to load group details. It may not exist or you may not have permission to view it.');
      setGroup(null);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (groupId) {
        fetchGroupAndPredictions();
    }
  }, [groupId]);

  const handleJoin = async () => {
    if (!groupId) return;
    setJoinLoading(true);
    try {
      await api.post(`/groups/${groupId}/join`);
      fetchGroupAndPredictions(); // Re-fetch all data
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to join group.');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleLeave = async () => {
    if (!groupId) return;
    setLeaveLoading(true);
    try {
      await api.post(`/groups/${groupId}/leave`);
      fetchGroupAndPredictions(); // Re-fetch all data
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to leave group.');
    } finally {
      setLeaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!group) {
    return null; // Or a 'Group not found' message
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
            <p className="text-md text-gray-500 mb-4">
              Created by @{group.creator.handle} &middot; {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
            </p>
          </div>
          {user && (
            <div>
              {group.is_member ? (
                <button
                  onClick={handleLeave}
                  disabled={leaveLoading}
                  className="px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-200"
                >
                  {leaveLoading ? 'Leaving...' : 'Leave Group'}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joinLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
                >
                  {joinLoading ? 'Joining...' : 'Join Group'}
                </button>
              )}
            </div>
          )}
        </div>
        <p className="text-lg text-gray-700 mt-4">{group.description}</p>
        <div className="mt-6 border-t pt-4">
          <h2 className="text-2xl font-semibold mb-4">Calls in this Group</h2>
          {predictions.length > 0 ? (
            <div className="space-y-4">
              {predictions.map((call) => (
                <CallCard key={call.prediction_id} call={call} onUpdate={fetchGroupAndPredictions} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mt-2">No calls have been made in this group yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}