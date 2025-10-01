'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { PlusIcon } from '@heroicons/react/20/solid';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Navigation() {
  const { user, logout, loading } = useAuth();

  const navigation = [
    { name: 'Home', href: '/', current: true },
    { name: 'Leaderboard', href: '/leaderboard', current: false },
    { name: 'Groups', href: '/groups', current: false },
  ];

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link href="/" className="text-2xl font-bold text-primary-600">
                    CallingItNow
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <Link
                          href="/predictions/new"
                          className="btn-primary inline-flex items-center"
                        >
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Make a Call
                        </Link>
                        
                        {/* Profile dropdown */}
                        <Menu as="div" className="relative">
                          <div>
                            <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                              <span className="sr-only">Open user menu</span>
                              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50">
                                <UserCircleIcon className="h-6 w-6 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                  @{user.handle}
                                </span>
                                <span className="wisdom-badge">
                                  Level {user.wisdom_level}
                                </span>
                              </div>
                            </Menu.Button>
                          </div>
                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/profile/me"
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    Your Profile
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <Link
                                    href="/predictions/my"
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    My Predictions
                                  </Link>
                                )}
                              </Menu.Item>
                              <Menu.Item>
                                {({ active }) => (
                                  <button
                                    onClick={logout}
                                    className={classNames(
                                      active ? 'bg-gray-100' : '',
                                      'block w-full text-left px-4 py-2 text-sm text-gray-700'
                                    )}
                                  >
                                    Sign out
                                  </button>
                                )}
                              </Menu.Item>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </>
                    ) : (
                      <div className="flex space-x-4">
                        <Link href="/auth/login" className="btn-outline">
                          Sign In
                        </Link>
                        <Link href="/auth/register" className="btn-primary">
                          Sign Up
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Mobile menu button */}
              <div className="sm:hidden flex items-center">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 pb-3 pt-2">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  href={item.href}
                  className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
                >
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            
            {!loading && (
              <div className="border-t border-gray-200 pb-3 pt-4">
                {user ? (
                  <div className="space-y-1">
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="h-10 w-10 text-gray-400" />
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">@{user.handle}</div>
                        <div className="text-sm font-medium text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Disclosure.Button
                        as={Link}
                        href="/predictions/new"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Make a Call
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        href="/profile/me"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Your Profile
                      </Disclosure.Button>
                      <Disclosure.Button
                        as={Link}
                        href="/predictions/my"
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        My Predictions
                      </Disclosure.Button>
                      <Disclosure.Button
                        as="button"
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Sign out
                      </Disclosure.Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Disclosure.Button
                      as={Link}
                      href="/auth/login"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign In
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      href="/auth/register"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Sign Up
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            )}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}