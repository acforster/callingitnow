'use client';

import { useState, useEffect } from 'react';
import api, { Comment } from '@/lib/api';
import CommentForm from './CommentForm';
import CommentThread from './CommentThread';
import LoadingSpinner from './LoadingSpinner';

type SortType = 'top' | 'new';

interface CommentSectionProps {
  predictionId: number;
}

export default function CommentSection({ predictionId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<SortType>('top');

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/predictions/${predictionId}/comments`, {
        params: { sort },
      });
      setComments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load comments.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [predictionId, sort]);

  return (
    <div className="bg-brand-background p-4 rounded-lg shadow-sm space-y-6">
      <h2 className="text-xl font-bold">Comments ({comments.length})</h2>

      {/* Comment Form for new top-level comments */}
      <CommentForm predictionId={predictionId} onCommentPosted={fetchComments} />

      <hr />

      {/* Sort Controls */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => setSort('top')}
          className={`px-3 py-1 text-sm font-semibold rounded-full ${sort === 'top' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          Top
        </button>
        <button 
          onClick={() => setSort('new')}
          className={`px-3 py-1 text-sm font-semibold rounded-full ${sort === 'new' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
          New
        </button>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-red-600 text-center py-8">{error}</p>
        ) : comments.length > 0 ? (
          comments.map(comment => (
            <CommentThread 
              key={comment.comment_id} 
              comment={comment} 
              predictionId={predictionId}
              onCommentChange={fetchComments}
            />
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No comments yet. Be the first!</p>
        )}
      </div>
    </div>
  );
}
