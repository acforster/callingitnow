'use client';

import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, FunnelIcon } from '@heroicons/react/20/solid';

interface PredictionFiltersProps {
  filters: {
    category: string;
    sort: 'recent' | 'popular' | 'controversial';
  };
  onFilterChange: (filters: Partial<{ category: string; sort: 'recent' | 'popular' | 'controversial' }>) => void;
  totalCount: number;
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

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'controversial', label: 'Most Controversial' },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PredictionFilters({ filters, onFilterChange, totalCount }: PredictionFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">
            {totalCount} predictions
          </span>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          {/* Category Filter */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                {filters.category || 'All Categories'}
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => onFilterChange({ category: '' })}
                        className={classNames(
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                          'block w-full text-left px-4 py-2 text-sm'
                        )}
                      >
                        All Categories
                      </button>
                    )}
                  </Menu.Item>
                  {categories.map((category) => (
                    <Menu.Item key={category}>
                      {({ active }) => (
                        <button
                          onClick={() => onFilterChange({ category })}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block w-full text-left px-4 py-2 text-sm'
                          )}
                        >
                          {category}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>

          {/* Sort Filter */}
          <Menu as="div" className="relative">
            <div>
              <Menu.Button className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                {sortOptions.find(option => option.value === filters.sort)?.label}
                <ChevronDownIcon className="-mr-1 h-5 w-5 text-gray-400" aria-hidden="true" />
              </Menu.Button>
            </div>

            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1">
                  {sortOptions.map((option) => (
                    <Menu.Item key={option.value}>
                      {({ active }) => (
                        <button
                          onClick={() => onFilterChange({ sort: option.value as any })}
                          className={classNames(
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'block w-full text-left px-4 py-2 text-sm'
                          )}
                        >
                          {option.label}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        </div>
      </div>

      {/* Active Filters */}
      {filters.category && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-x-0.5 rounded-md bg-primary-50 px-2 py-1 text-xs font-medium text-primary-700">
            {filters.category}
            <button
              type="button"
              onClick={() => onFilterChange({ category: '' })}
              className="group relative -mr-1 h-3.5 w-3.5 rounded-sm hover:bg-primary-600/20"
            >
              <span className="sr-only">Remove filter</span>
              <svg viewBox="0 0 14 14" className="h-3.5 w-3.5 stroke-primary-600/50 group-hover:stroke-primary-600/75">
                <path d="m4 4 6 6m0-6-6 6" />
              </svg>
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
