'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/auth';
import { predictionsAPI, Prediction } from '@/lib/api';
import { 
  HandThumbUpIcon, 
  HandThumbDownIcon, 
  HeartIcon,
  ShareIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import {
  HandThumbUpIcon as HandThumbUpSolidIcon,
  HandThumbDownIcon as HandThumbDownSolidIcon,
  HeartIcon as HeartSolidIcon
} from '@heroicons/react/24/solid';

interface PredictionCardProps {
  prediction: Prediction;
  onUpdate?: () => void;
}

export default function PredictionCard({ prediction, onUpdate }: PredictionCardProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localVote, setLocalVote] = useState(prediction.user_vote);
  const [localBacked, setLocalBacked] = useState(prediction.user_backed);
  const [voteScore, setVoteScore] = useState(prediction.vote_score);
  const [backingCount, setBackingCount] = useState(prediction.backing_count);

  const handleVote = async (value: number) => {
    if (!user || loading) return;

    setLoading(true);
    try {
      await predictionsAPI.vote(prediction.prediction_id, value);
      
      // Update local state
      const oldVote = localVote || 0;
      const newVote = localVote === value ? 0 : value;
      
      setLocalVote(newVote === 0 ? undefined : newVote);
      setVoteScore(prev => prev - oldVote + newVote);
      
      onUpdate?.();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (!user || loading || localBacked) return;

    setLoading(true);
    try {
      await predictionsAPI.back(prediction.prediction_id);
      setLocalBacked(true);
      setBackingCount(prev => prev + 1);
      onUpdate?.();
    } catch (error) {
      console.error('Failed to back prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    const url = `${window.location.origin}/predictions/${prediction.prediction_id}`;
    try {
      await navigator.clipboard.writeText(url);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: 'bg-blue-100 text-blue-800',
      Politics: 'bg-red-100 text-red-800',
      Sports: 'bg-green-100 text-green-800',
      Entertainment: 'bg-purple-100 text-purple-800',
      Business: 'bg-yellow-100 text-yellow-800',
      Science: 'bg-indigo-100 text-indigo-800',
      Weather: 'bg-cyan-100 text-cyan-800',
      Economics: 'bg-orange-100 text-orange-800',
      Social: 'bg-pink-100 text-pink-800',
      Other: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || colors.Other;
  };

  return (
    <div className="prediction-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-semibold text-sm">
                {prediction.user.handle.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <Link 
                href={`/profile/${prediction.user.handle}`}
                className="font-medium text-gray-900 hover:text-primary-600"
              >
                @{prediction.user.handle}
              </Link>
              <span className="wisdom-badge">
                Level {prediction.user.wisdom_level}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(prediction.timestamp), { addSuffix: true })}
            </p>
          </div>
        </div>
        
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(prediction.category)}`}>
          {prediction.category}
        </span>
      </div>

      {/* Content */}
      <div className="mb-4">
        <Link href={`/predictions/${prediction.prediction_id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-primary-600 cursor-pointer">
            {prediction.title}
          </h3>
        </Link>
        <p className="text-gray-700 leading-relaxed">
          {prediction.content.length > 300 
            ? `${prediction.content.substring(0, 300)}...` 
            : prediction.content
          }
        </p>
        {prediction.content.length > 300 && (
          <Link 
            href={`/predictions/${prediction.prediction_id}`}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block"
          >
            Read more
          </Link>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-6">
          {/* Voting */}
          <div className="flex items-center space-x-2">
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
          {prediction.allow_backing && (
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
            onClick={copyToClipboard}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <ShareIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Share</span>
          </button>

          {/* Receipt */}
          <Link
            href={`/predictions/${prediction.prediction_id}/receipt`}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span className="text-sm font-medium">Receipt</span>
          </Link>
        </div>
      </div>

      {/* Hash (for verification) */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 font-mono">
          Hash: {prediction.hash.substring(0, 16)}...
        </p>
      </div>
    </div>
  );
}
