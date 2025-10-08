'use client';

import React, { useState } from 'react';
import { Prediction as Call, predictionsAPI } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import {
  HandThumbUpIcon,
  HandThumbDownIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  HeartIcon as HeartSolidIcon,
} from '@heroicons/react/24/solid';
import { timeAgo } from '@/lib/time';

interface CallCardProps {
  call: Call;
  onUpdate?: () => void;
}

const CallCard: React.FC<CallCardProps> = ({ call, onUpdate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local state for immediate UI feedback
  const [localVote, setLocalVote] = useState(call.user_vote);
  const [voteScore, setVoteScore] = useState(call.vote_score);
  const [localBacked, setLocalBacked] = useState(call.user_backed);
  const [backingCount, setBackingCount] = useState(call.backing_count);

  const handleVote = async (value: number) => {
    if (!user || loading) return;

    setLoading(true);
    setError(null);

    const originalVote = localVote;
    const originalScore = voteScore;

    // Optimistic UI update
    let newVote = value;
    if (originalVote === value) {
      // User is undoing their vote
      newVote = 0;
      setVoteScore(originalScore - value);
    } else {
      // New vote or changing vote
      setVoteScore(originalScore - (originalVote || 0) + value);
    }
    setLocalVote(newVote);

    try {
      await predictionsAPI.vote(call.prediction_id, newVote);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Vote failed. Please try again.');
      // Revert UI on failure
      setLocalVote(originalVote);
      setVoteScore(originalScore);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (!user || loading || localBacked) return;

    setLoading(true);
    setError(null);

    // Optimistic UI update
    setLocalBacked(true);
    setBackingCount(backingCount + 1);

    try {
      await predictionsAPI.back(call.prediction_id);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Failed to back this call.');
      // Revert UI on failure
      setLocalBacked(false);
      setBackingCount(backingCount - 1);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/predictions/${call.prediction_id}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  return (
    <div className="bg-brand-background rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">      {/* Card Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-primary-600">
              {call.user.handle.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">@{call.user.handle}</p>
            <p className="text-xs text-gray-500">
              Wisdom Level: {call.user.wisdom_level}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          {call.visibility === 'private' ? (
            <EyeSlashIcon className="h-4 w-4" />
          ) : (
            <EyeIcon className="h-4 w-4" />
          )}
          <span>{timeAgo(call.timestamp)}</span>
        </div>
      </div>

      {/* Card Body */}
      <Link href={`/calls/${call.prediction_id}`} className="space-y-2 block hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors">
        <h2 className="text-xl font-bold text-gray-800">{call.title}</h2>
        <p className="text-gray-600 leading-relaxed">{call.content}</p>
      </Link>

      {/* Card Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4">
          {/* Voting */}
          <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
            <button
              onClick={() => handleVote(1)}
              disabled={!user || loading}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                localVote === 1
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-green-600'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {localVote === 1 ? (
                <HandThumbUpSolidIcon className="h-4 w-4" />
              ) : (
                <HandThumbUpIcon className="h-4 w-4" />
              )}
            </button>
            
            <span className={`font-medium ${voteScore > 0 ? 'text-green-600' : voteScore < 0 ? 'text-red-600' : 'text-gray-500'}`}>
              {voteScore > 0 ? '+' : ''}{voteScore}
            </span>
            
            <button
              onClick={() => handleVote(-1)}
              disabled={!user || loading}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-colors ${
                localVote === -1
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {localVote === -1 ? (
                <HandThumbDownSolidIcon className="h-4 w-4" />
              ) : (
                <HandThumbDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Backing */}
          {call.allow_backing && (
            <button
              onClick={handleBack}
              disabled={!user || loading || localBacked}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-colors ${
                localBacked
                  ? 'bg-red-100 text-red-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-red-600'
              } ${!user || localBacked ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {localBacked ? (
                <HeartSolidIcon className="h-4 w-4" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">
                {localBacked ? 'Backed' : 'Back'} {backingCount > 0 && `(${backingCount})`}
              </span>
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Share */}
          <button
            onClick={handleShare}
            className="text-gray-400 hover:text-primary-600 transition-colors p-2 rounded-lg"
            title="Copy link to call"
          >
            <ShareIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && <p className="text-xs text-red-500 text-center mt-2">{error}</p>}
    </div>
  );
};

export default CallCard;