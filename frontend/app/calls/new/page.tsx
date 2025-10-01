'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { predictionsAPI } from '@/lib/api';
import { useForm } from 'react-hook-form';
import LoadingSpinner from '@/components/LoadingSpinner';

interface CallForm {
  title: string;
  content: string;
  category: string;
  visibility: 'public' | 'private';
  allow_backing: boolean;
}

const categories = [
  'Technology',
  'Politics',
  'Sports',
  'Entertainment',
  'Business',
  'Science',
  'Weather',
  'Economics',
  'Social',
  'Other'
];

export default function NewCallPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CallForm>({
    defaultValues: {
      visibility: 'public',
      allow_backing: true,
    },
  });

  const watchedContent = watch('content', '');

  const onSubmit = async (data: CallForm) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // The API still uses 'prediction', so we call it as such
      const newCall = await predictionsAPI.create(data);
      // But we redirect to the new frontend URL
      router.push(`/calls/${newCall.prediction_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create call. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Sign in to make a call
        </h1>
        <p className="text-gray-600 mb-6">
          You need to be signed in to create calls.
        </p>
        <a href="/auth/login" className="btn-primary">
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Make a Call
        </h1>
        <p className="text-gray-600">
          Record your call about a future event. Be specific and clear about what you're calling.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="card">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Call Title *
              </label>
              <input
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters',
                  },
                  maxLength: {
                    value: 120,
                    message: 'Title must be less than 120 characters',
                  },
                })}
                type="text"
                className="input-field"
                placeholder="What are you calling will happen?"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Detailed Call *
              </label>
              <textarea
                {...register('content', {
                  required: 'Call details are required',
                  minLength: {
                    value: 20,
                    message: 'Call must be at least 20 characters',
                  },
                })}
                rows={6}
                className="input-field"
                placeholder="Provide detailed information about your call. Include timeframes, specific conditions, and any relevant context..."
              />
              <div className="flex justify-between items-center mt-1">
                {errors.content ? (
                  <p className="text-sm text-red-600">{errors.content.message}</p>
                ) : (
                  <p className="text-sm text-gray-500">
                    Be specific and clear about what you're calling
                  </p>
                )}
                <p className="text-sm text-gray-400">
                  {watchedContent.length} characters
                </p>
              </div>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', {
                  required: 'Please select a category',
                })}
                className="input-field"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Visibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Visibility
              </label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    {...register('visibility')}
                    id="public"
                    type="radio"
                    value="public"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="public" className="ml-3 block text-sm text-gray-700">
                    <span className="font-medium">Public</span>
                    <span className="block text-gray-500">
                      Anyone can see this call and vote on it
                    </span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    {...register('visibility')}
                    id="private"
                    type="radio"
                    value="private"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <label htmlFor="private" className="ml-3 block text-sm text-gray-700">
                    <span className="font-medium">Private</span>
                    <span className="block text-gray-500">
                      Only you can see this call
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Allow Backing */}
            <div>
              <div className="flex items-center">
                <input
                  {...register('allow_backing')}
                  id="allow_backing"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="allow_backing" className="ml-3 block text-sm text-gray-700">
                  <span className="font-medium">Allow others to back this call</span>
                  <span className="block text-gray-500">
                    Other users can show support for your call, increasing your wisdom level
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary min-w-[120px]"
          >
            {loading ? (
              <LoadingSpinner size="sm" />
            ) : (
              'Make Call'
            )}
          </button>
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">
          📝 Call Guidelines
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific about what you're calling and when it will happen</li>
          <li>• Avoid vague or ambiguous statements</li>
          <li>• Include relevant context and reasoning</li>
          <li>• Keep calls family-friendly and respectful</li>
          <li>• Each call gets a unique hash for verification</li>
        </ul>
      </div>
    </div>
  );
}