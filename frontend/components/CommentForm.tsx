'use client';

import { useState, FormEvent } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import LoadingSpinner from './LoadingSpinner';

interface CommentFormProps {
  predictionId: number;
  parentId?: number | null;
  onCommentPosted: () => void; // Callback to refresh comments
  placeholder?: string;
  buttonText?: string;
}

export default function CommentForm({ 
  predictionId,
  parentId = null,
  onCommentPosted,
  placeholder = "Add a comment...",
  buttonText = "Post Comment"
}: CommentFormProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.post(`/predictions/${predictionId}/comments`, {
        content,
        parent_comment_id: parentId,
      });
      setContent(''); // Clear form on success
      onCommentPosted(); // Trigger refresh
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to post comment.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null; // Don't show the form if the user is not logged in
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="input w-full"
        rows={3}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={isLoading || !content.trim()} className="btn-primary">
          {isLoading ? <LoadingSpinner size="sm" /> : buttonText}
        </button>
      </div>
    </form>
  );
}
