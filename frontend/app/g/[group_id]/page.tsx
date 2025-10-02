'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth'; // 1. Import useAuth

// Define the same Group types we used on the main groups page
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
  is_member?: boolean; // 2. Add is_member flag
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.group_id;
  const { user } = useAuth(); // 3. Get user from auth context

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false); // 4. Add loading state for the button
  const [leaveLoading, setLeaveLoading] = useState(false); // 1. Add loading state for leaving


  const fetchGroup = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const response = await api.get(`/groups/${groupId}`);
      setGroup(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load group details. It may not exist or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

 
  useEffect(() => {
    fetchGroup();
  }, [groupId]);

  // 5. Add handler for joining the group
  const handleJoin = async () => {
    if (!groupId) return;
    setJoinLoading(true);
    try {
      await api.post(`/groups/${groupId}/join`);
      fetchGroup(); // Re-fetch group data to update member count and status
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to join group.');
    } finally {
      setJoinLoading(false);
    }
  };

  // 6. Add handler for leaving the group
  const handleLeave = async () => {
    if (!groupId) return;
    setLeaveLoading(true);
    try {
      await api.post(`/groups/${groupId}/leave`);
      fetchGroup(); // Re-fetch group data to update member count and status
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
    return null;
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
          {/* 6. Add the Join/Joined button */}
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
          <h2 className="text-2xl font-semibold">Calls in this Group</h2>
          <p className="text-gray-500 mt-2">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}