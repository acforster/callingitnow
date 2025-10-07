'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import { HomeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

// Define the Group type to match our API response
interface Group {
  group_id: number;
  name: string;
}

export default function LeftSidebar() {
  const { user } = useAuth();
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setIsLoading(true);
      setError(null);
      api.get('/groups/me')
        .then(response => {
          setJoinedGroups(response.data.groups);
        })
        .catch(err => {
          console.error("Failed to fetch user's groups", err);
          setError('Could not load your groups.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // Clear groups if user logs out
      setJoinedGroups([]);
    }
  }, [user]);

  return (
    <aside className="col-span-12 lg:col-span-3 order-1 lg:order-1">
      <div className="sticky top-24 space-y-6">
        <div className="bg-brand-background p-4 rounded-lg shadow-sm">
          <nav className="space-y-1">
            <Link href="/" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <HomeIcon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              Home
            </Link>
            <Link href="/groups" className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
              <UserGroupIcon className="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
              Groups
            </Link>
          </nav>
        </div>
        {user && (
          <div className="bg-brand-background p-4 rounded-lg shadow-sm">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Your Groups
            </h3>
            <div className="mt-2 space-y-1">
              {isLoading ? (
                <div className="px-2 py-2 text-sm text-gray-500">Loading...</div>
              ) : error ? (
                <div className="px-2 py-2 text-sm text-red-600">{error}</div>
              ) : joinedGroups.length > 0 ? (
                joinedGroups.map((group) => (
                  <Link key={group.group_id} href={`/g/${group.group_id}`} className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                    <span className="truncate">{group.name}</span>
                  </Link>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-gray-500">You haven't joined any groups yet.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}