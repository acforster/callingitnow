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
