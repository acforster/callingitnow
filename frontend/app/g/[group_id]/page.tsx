'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api, { Prediction as Call } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useAuth } from '@/lib/auth';
import CallCard from '@/components/CallCard';
import CreateCallForm from '@/components/CreateCallForm';
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebar from '@/components/RightSidebar';
import { Dialog, Transition } from '@headlessui/react';
import { ExclamationTriangleIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

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

// DeleteGroupSection component
function DeleteGroupSection({ groupId, groupName, onDeleteSuccess }: { groupId: string; groupName: string; onDeleteSuccess: () => void; }) {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/groups/${groupId}`);
      alert('Group deleted successfully.');
      onDeleteSuccess();
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete group.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeleteLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <button
        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
        className="w-full flex justify-between items-center text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <span>Danger Zone</span>
        <ChevronDownIcon className={`h-5 w-5 transition-transform ${isAccordionOpen ? 'rotate-180' : ''}`} />
      </button>
      {isAccordionOpen && (
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Deleting the group is permanent and cannot be undone. All associated predictions and memberships will be removed.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-3 w-full px-4 py-2 border border-red-600 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete Group
          </button>
        </div>
      )}

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                    Delete Group
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete the group "{groupName}"? This action is permanent and cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading ? <LoadingSpinner size="sm" /> : 'Delete'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}


export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
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

    const isOwner = user?.user_id === group.creator.user_id;

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
              {isOwner ? (
                <DeleteGroupSection 
                  groupId={groupId} 
                  groupName={group.name} 
                  onDeleteSuccess={() => router.push('/groups')}
                />
              ) : group.is_member ? (
                <button
                  onClick={handleLeave}
                  disabled={leaveLoading}
                  className="w-full btn-outline-danger"
                >
                  {leaveLoading ? <LoadingSpinner size="sm" /> : 'Leave Group'}
                </button>
              ) : (
                <button
                  onClick={handleJoin}
                  disabled={joinLoading}
                  className="w-full btn-primary"
                >
                  {joinLoading ? <LoadingSpinner size="sm" /> : 'Join Group'}
                </button>
              )}
            </div>
          )}
        </div>
        {group.is_member && !isOwner && (
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