'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';

// Define the Group type to match our API response
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

export default function GroupsPage() {
  const { user } = useAuth();
  
  // State for the creation form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // State for the list of groups
  const [groups, setGroups] = useState<Group[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const fetchGroups = async () => {
    try {
      setListLoading(true);
      const response = await api.get('/groups');
      setGroups(response.data.groups);
      setListError(null);
    } catch (err) {
      setListError('Failed to load groups.');
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a group.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/groups', {
        name,
        description,
        visibility,
      });
      setSuccess(`Group "${response.data.name}" created successfully!`);
      setName('');
      setDescription('');
      setVisibility('public');
      fetchGroups(); // Re-fetch groups to update the list
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create group.');
    } finally {
      setLoading(false);
    }
  };

  const renderCreateGroupForm = () => (
    <div className="bg-brand-background p-4 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Create a New Group</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          ></textarea>
        </div>
        <div>
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibility</label>
          <select
            id="visibility"
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="secret">Secret</option>
          </select>
        </div>
        
        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div>
          <button
            type="submit"
            disabled={loading || !user}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
          >
            {loading ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderGroupList = () => {
    if (listLoading) {
      return (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      );
    }

    if (listError) {
      return <p className="text-red-600 bg-brand-background p-4 rounded-lg">{listError}</p>;
    }

    return (
      <div className="space-y-4">
        {groups.length > 0 ? (
          groups.map((group) => (
            <Link key={group.group_id} href={`/g/${group.group_id}`} className="block">
              <div className="bg-brand-background p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-xl font-bold text-primary-700">{group.name}</h3>
                <p className="text-sm text-gray-500 mb-2">Created by @{group.creator.handle}</p>
                <p className="text-gray-700">{group.description}</p>
                <div className="mt-3 text-sm text-gray-600">
                  <span>{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p className="bg-brand-background p-4 rounded-lg">No public groups found. Why not create the first one?</p>
        )}
      </div>
    );
  };

  return (
    <>
      <LeftSidebar />
      
      <div className="col-span-12 lg:col-span-6 order-2 lg:order-2">
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Public Groups</h1>
            {renderGroupList()}
        </div>
      </div>

      <RightSidebar>
        {renderCreateGroupForm()}
      </RightSidebar>
    </>
  );
}