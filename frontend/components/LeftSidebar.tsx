'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { HomeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function LeftSidebar() {
  const { user } = useAuth();

  // TODO: Replace with actual user's groups
  const joinedGroups = [
    { id: 1, name: 'Tech Predictions' },
    { id: 2, name: 'Sports Bets' },
  ];

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
              {joinedGroups.map((group) => (
                <Link key={group.id} href={`/g/${group.id}`} className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50">
                  <span className="truncate">{group.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}