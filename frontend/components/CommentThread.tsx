'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Comment as CommentType } from '@/lib/api'; // Assuming you'll export Comment type from api
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { ArrowUpIcon, ArrowDownIcon, ChatBubbleOvalLeftEllipsisIcon, TrashIcon } from '@heroicons/react/24/outline';
import CommentForm from './CommentForm';

interface CommentThreadProps {
  comment: CommentType;
  predictionId: number;
  onCommentChange: () => void; // Callback to refresh all comments
  depth?: number;
}

const MAX_DEPTH = 5; // Maximum nesting level before showing 'Continue thread'

export default function CommentThread({ comment, predictionId, onCommentChange, depth = 0 }: CommentThreadProps) {
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (!user) return alert('You must be logged in to vote.');
    
    // If user clicks the same vote again, treat it as a removal (value 0)
    const voteValue = comment.user_vote === value ? 0 : value;

    try {
      await api.post(`/comments/${comment.comment_id}/vote`, { value: voteValue });
      onCommentChange(); // Refresh to show new vote score
    } catch (err) {
      alert('Failed to cast vote.');
    }
  };

  const handleDelete = async () => {
    if (!user || user.user_id !== comment.user.user_id) return;
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/comments/${comment.comment_id}`);
        onCommentChange();
      } catch (err) {
        alert('Failed to delete comment.');
      }
    }
  };

  return (
    <div className={`ml-${depth * 4} space-y-2`}>
      <div className="bg-brand-background-light p-3 rounded-lg">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Link href={`/profile/${comment.user.handle}`} className="font-semibold hover:underline">@{comment.user.handle}</Link>
          <span>•</span>
          <span>{new Date(comment.timestamp).toLocaleString()}</span>
        </div>
        <p className="text-gray-800 my-2">{comment.content}</p>
        <div className="flex items-center space-x-4 text-xs font-medium">
          <div className="flex items-center space-x-1">
            <button onClick={() => handleVote(1)} className={`p-1 rounded-full ${comment.user_vote === 1 ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-200'}`}>
              <ArrowUpIcon className="h-4 w-4" />
            </button>
            <span className="font-semibold">{comment.vote_score}</span>
            <button onClick={() => handleVote(-1)} className={`p-1 rounded-full ${comment.user_vote === -1 ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}>
              <ArrowDownIcon className="h-4 w-4" />
            </button>
          </div>
          <button onClick={() => setIsReplying(!isReplying)} className="flex items-center space-x-1 hover:text-primary-600">
            <ChatBubbleOvalLeftEllipsisIcon className="h-4 w-4" />
            <span>Reply</span>
          </button>
          {user && user.user_id === comment.user.user_id && (
            <button onClick={handleDelete} className="flex items-center space-x-1 text-red-500 hover:text-red-700">
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {isReplying && (
        <div className="pt-2">
          <CommentForm 
            predictionId={predictionId} 
            parentId={comment.comment_id} 
            onCommentPosted={() => {
              setIsReplying(false);
              onCommentChange();
            }}
            placeholder={`Replying to @${comment.user.handle}...`}
            buttonText="Post Reply"
          />
        </div>
      )}

      <div className="border-l-2 border-gray-200 pl-4 space-y-4">
        {depth < MAX_DEPTH ? (
          comment.replies?.map(reply => (
            <CommentThread 
              key={reply.comment_id} 
              comment={reply} 
              predictionId={predictionId}
              onCommentChange={onCommentChange}
              depth={depth + 1} 
            />
          ))
        ) : comment.replies && comment.replies.length > 0 ? (
          <Link href={`/comment/${comment.comment_id}`} className="text-sm font-medium text-primary-600 hover:underline">
            Continue this thread →
          </Link>
        ) : null}
      </div>
    </div>
  );
}
