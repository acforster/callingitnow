'use client';

import { useState } from 'react';
import api from '@/lib/api';

interface CreateCallFormProps {
  groupId: string;
  onCallCreated: () => void;
}

export default function CreateCallForm({ groupId, onCallCreated }: CreateCallFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || loading) return;

    setLoading(true);
    setError(null);

    try {
      await api.post('/predictions', {
        title,
        content,
        group_id: parseInt(groupId, 10),
        category: 'General', // Defaulting category for now
        visibility: 'public', // Group calls are public within the group context
        allow_backing: true,
      });
      
      // Clear form and trigger refresh
      setTitle('');
      setContent('');
      onCallCreated();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border mb-6">
      <h3 className="text-lg font-semibold mb-3">Make a New Call in this Group</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="call-title" className="sr-only">Title</label>
          <input
            id="call-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="The call..."
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label htmlFor="call-content" className="sr-only">Content</label>
          <textarea
            id="call-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add more details..."
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400"
          >
            {loading ? 'Submitting...' : 'Submit Call'}
          </button>
        </div>
      </form>
    </div>
  );
}