'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api, { Prediction as Call, User } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth';
import CallCard from '@/components/CallCard';
import CreateCallForm from '@/components/CreateCallForm';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';

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
    if (!group) setLoading(true);

    try {
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
      fetchGroupAndPredictions();
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
      fetchGroupAndPredictions();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to leave group.');
    } finally {
      setLeaveLoading(false);
    }
  };

  const renderMainContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-red-600 bg-brand-background rounded-lg shadow-sm p-4">
          <p>{error}</p>
        </div>
      );
    }
    
    if (!group) {
        return (
            <div className="text-center py-12 text-red-600 bg-brand-background rounded-lg shadow-sm p-4">
              <p>Group not found.</p>
            </div>
          );
    }

    return (
      <div className="space-y-4">
        <div className="bg-brand-background rounded-lg shadow-sm p-4">
            <h1 className="text-2xl font-bold">{group.name}</h1>
        </div>
        {predictions.length > 0 ? (
          predictions.map((call) => (
            <CallCard key={call.prediction_id} call={call} onUpdate={fetchGroupAndPredictions} />
          ))
        ) : (
          <div className="text-center py-12 bg-brand-background rounded-lg shadow-sm p-4">
            <p className="text-gray-500">No calls have been made in this group yet.</p>
          </div>
        )}
      </div>
    );
  };

  const renderRightSidebar = () => {
    if (!group) return null;

    return (
      <>
        <div className="bg-brand-background p-4 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">{group.name}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Created by @{group.creator.handle}
          </p>
          <p className="text-sm text-gray-500">
            {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
          </p>
          <p className="mt-4 text-gray-700">{group.description}</p>
          {user && (
            <div className="mt-4">
              {group.is_member ? (
                <button
                  onClick={handleLeave}
                  disabled={leaveLoading}
                  className="w-full px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-brand-background hover:bg-red-50 disabled:bg-gray-200"
                >
                  {leaveLoading ? 'Leaving...' : 'Leave Group'}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joinLoading}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
                >
                  {joinLoading ? 'Joining...' : 'Join Group'}
                </button>
              )}
            </div>
          )}
        </div>
        {group.is_member && (
          <CreateCallForm groupId={groupId} onCallCreated={fetchGroupAndPredictions} />
        )}
      </>
    );
  };

  return (
    <>
      <LeftSidebar />
      <div className="col-span-12 lg:col-span-6 order-2 lg:order-2">
        {renderMainContent()}
      </div>
      <RightSidebar>
        {renderRightSidebar()}
      </RightSidebar>
    </>
  );
}