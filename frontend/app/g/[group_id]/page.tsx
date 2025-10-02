'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';

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
}

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.group_id;

  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!groupId) return;

    const fetchGroup = async () => {
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

    fetchGroup();
  }, [groupId]);

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
    return null; // Should be handled by error state
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-4xl font-bold mb-2">{group.name}</h1>
        <p className="text-md text-gray-500 mb-4">
          Created by @{group.creator.handle} &middot; {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
        </p>
        <p className="text-lg text-gray-700">{group.description}</p>
        <div className="mt-4 border-t pt-4">
          {/* We will add the list of calls/predictions here later */}
          <h2 className="text-2xl font-semibold">Calls in this Group</h2>
          <p className="text-gray-500 mt-2">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}