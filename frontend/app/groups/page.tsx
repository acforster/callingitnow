'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Link from 'next/link';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import LoadingSpinner from '@/components/LoadingSpinner';
import Accordion from '@/components/Accordion';

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

// A generic component to render a list of groups
const GroupList = ({ groups, isLoading, error }: { groups: Group[], isLoading: boolean, error: string | null }) => {
  if (isLoading) {
    return <div className="flex justify-center py-4"><LoadingSpinner /></div>;
  }
  if (error) {
    return <p className="text-red-600 p-4">{error}</p>;
  }
  if (groups.length === 0) {
    return <p className="p-4 text-gray-500">No groups found.</p>;
  }
  return (
    <div className="space-y-2 p-2">
      {groups.map((group) => (
        <Link key={group.group_id} href={`/g/${group.group_id}`} className="block">
          <div className="bg-brand-background p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-primary-700">{group.name}</h3>
            <p className="text-xs text-gray-500">
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};


export default function GroupsPage() {
  const { user } = useAuth();

  // State for the creation form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);

  // State for the different group lists
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [popularGroups, setPopularGroups] = useState<Group[]>([]);
  const [topGroups, setTopGroups] = useState<Group[]>([]);
  
  const [myGroupsLoading, setMyGroupsLoading] = useState(true);
  const [popularLoading, setPopularLoading] = useState(true);
  const [topLoading, setTopLoading] = useState(true);

  const [myGroupsError, setMyGroupsError] = useState<string | null>(null);
  const [popularError, setPopularError] = useState<string | null>(null);
  const [topError, setTopError] = useState<string | null>(null);

  const fetchAllGroups = () => {
    // Fetch My Groups (if logged in)
    if (user) {
      setMyGroupsLoading(true);
      api.get('/groups/me')
        .then(res => setMyGroups(res.data.groups))
        .catch(() => setMyGroupsError('Failed to load your groups.'))
        .finally(() => setMyGroupsLoading(false));
    } else {
        setMyGroupsLoading(false);
    }

    // Fetch Popular Groups
    setPopularLoading(true);
    api.get('/groups?sort=popular')
      .then(res => setPopularGroups(res.data.groups))
      .catch(() => setPopularError('Failed to load popular groups.'))
      .finally(() => setPopularLoading(false));

    // Fetch Top Groups
    setTopLoading(true);
    api.get('/groups?sort=top')
      .then(res => setTopGroups(res.data.groups))
      .catch(() => setTopError('Failed to load top groups.'))
      .finally(() => setTopLoading(false));
  };

  useEffect(() => {
    fetchAllGroups();
  }, [user]);

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setCreateError('You must be logged in to create a group.');
      return;
    }

    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const response = await api.post('/groups', { name, description, visibility });
      setCreateSuccess(`Group "${response.data.name}" created!`);
      setName('');
      setDescription('');
      // After creating, re-fetch all group lists
      fetchAllGroups();
    } catch (err: any) {
      setCreateError(err.response?.data?.detail || 'Failed to create group.');
    } finally {
      setCreateLoading(false);
    }
  };

  const renderCreateGroupForm = () => (
    <Accordion title="Create a New Group" defaultOpen={false}>
        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Group Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="input" />
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} className="input"></textarea>
            </div>
            <div>
                <label htmlFor="visibility" className="block text-sm font-medium text-gray-700">Visibility</label>
                <select id="visibility" value={visibility} onChange={(e) => setVisibility(e.target.value)} className="input">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
            </div>
            {createError && <p className="text-sm text-red-600">{createError}</p>}
            {createSuccess && <p className="text-sm text-green-600">{createSuccess}</p>}
            <div>
                <button type="submit" disabled={createLoading || !user} className="btn-primary w-full">
                    {createLoading ? 'Creating...' : 'Create Group'}
                </button>
            </div>
        </form>
    </Accordion>
  );

  return (
    <>
      <LeftSidebar />
      
      <div className="col-span-12 lg:col-span-6 order-2 lg:order-2">
        <div className="space-y-4">
            <h1 className="text-3xl font-bold px-4">Groups</h1>
            
            {user && (
                <Accordion title="My Groups" defaultOpen={true}>
                    <GroupList groups={myGroups} isLoading={myGroupsLoading} error={myGroupsError} />
                </Accordion>
            )}

            <Accordion title="Popular Groups" defaultOpen={true}>
                <p className="text-xs text-gray-400 px-4 -mt-2 mb-2">Groups with the most posts in the last 24 hours.</p>
                <GroupList groups={popularGroups} isLoading={popularLoading} error={popularError} />
            </Accordion>

            <Accordion title="Top Groups" defaultOpen={true}>
                <p className="text-xs text-gray-400 px-4 -mt-2 mb-2">Groups with the most posts of all time.</p>
                <GroupList groups={topGroups} isLoading={topLoading} error={topError} />
            </Accordion>
        </div>
      </div>

      <RightSidebar>
        {renderCreateGroupForm()}
      </RightSidebar>
    </>
  );
}