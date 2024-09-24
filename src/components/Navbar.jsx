import React, { Fragment, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  HomeIcon,
  TagIcon,
  InformationCircleIcon,
  PhoneIcon,
  UserCircleIcon,
  UserPlusIcon,
  IdentificationIcon,
} from '@heroicons/react/24/outline';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { getDoc, doc } from 'firebase/firestore';

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Navbar() {
  const [user] = useAuthState(auth);
  const [profilePic, setProfilePic] = useState('');
  const [userName, setUserName] = useState('User');
  const location = useLocation();

  useEffect(() => {
    const fetchProfileData = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfilePic(userData.profilePic || 'https://via.placeholder.com/40');
          setUserName(userData.name || 'User');
        }
      }
    };
    fetchProfileData();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully signed out!");
    } catch (error) {
      toast.error("Error signing out: " + (error.message || "Please try again."));
    }
  };

  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Products', href: '/products', icon: TagIcon },
    { name: 'About', href: '/about', icon: InformationCircleIcon },
    { name: 'Contact', href: '/contact', icon: PhoneIcon },
  ];

  return (
    <Disclosure as="nav" className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between items-center">
              {/* Logo and Site Name */}
              <div className="flex items-center">
                <Link to="/" className="flex-shrink-0 flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/kamikoto-logo-transparent-darkish-logo-for-better-visibility.png"
                    alt="KamiKoto"
                  />
                  <span className="text-2xl font-extrabold text-white ml-2">KamiKoto</span>
                </Link>
                {/* Desktop Navigation */}
                <div className="hidden md:flex md:ml-10 space-x-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        location.pathname === item.href
                          ? 'bg-indigo-700 text-white'
                          : 'text-gray-300 hover:bg-indigo-500 hover:text-white',
                        'px-3 py-2 rounded-md text-sm font-medium flex items-center transition duration-300'
                      )}
                    >
                      <item.icon className="h-5 w-5 mr-1" aria-hidden="true" />
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              {/* Right Side: Cart and User Menu */}
              <div className="flex items-center">
                <Link to="/cart" className="relative mr-4">
                  <ShoppingCartIcon className="h-6 w-6 text-gray-300 hover:text-white transition duration-300" aria-hidden="true" />
                </Link>
                {user ? (
                  <Menu as="div" className="relative">
                    <div>
                      <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-indigo-600 focus:ring-white">
                        <img
                          className="h-8 w-8 rounded-full"
                          src={profilePic}
                          alt="User profile"
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-150"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <Link
                              to="/profile"
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                              )}
                            >
                              <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                              Your Profile
                            </Link>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleSignOut}
                              className={classNames(
                                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                                'flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                              )}
                            >
                              <XMarkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <div className="hidden md:flex items-center space-x-2">
                    <Link
                      to="/signin"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-indigo-500 hover:text-white transition duration-300"
                    >
                      <IdentificationIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                      Sign in
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-indigo-500 hover:text-white transition duration-300"
                    >
                      <UserPlusIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
              {/* Mobile menu button */}
              <div className="flex md:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-gray-300 hover:text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
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

          {/* Mobile Menu Panel */}
          <Disclosure.Panel className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navigation.map((item) => (
                <Disclosure.Button
                  key={item.name}
                  as={Link}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-indigo-700 text-white'
                      : 'text-gray-300 hover:bg-indigo-500 hover:text-white',
                    'flex items-center px-3 py-2 rounded-md text-base font-medium transition duration-300'
                  )}
                >
                  <item.icon className="h-5 w-5 mr-2" aria-hidden="true" />
                  {item.name}
                </Disclosure.Button>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-indigo-700">
              {user ? (
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <img
                      className="h-10 w-10 rounded-full"
                      src={profilePic}
                      alt="User profile"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{userName}</div>
                    <div className="text-sm font-medium text-indigo-200">{user.email}</div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col px-5 space-y-2">
                  <Link
                    to="/signin"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-indigo-500 hover:text-white transition duration-300"
                  >
                    <IdentificationIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Sign in
                  </Link>
                  <Link
                    to="/signup"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-indigo-500 hover:text-white transition duration-300"
                  >
                    <UserPlusIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Sign up
                  </Link>
                </div>
              )}
              {user && (
                <div className="mt-3 px-2 space-y-1">
                  <Disclosure.Button
                    as={Link}
                    to="/profile"
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-indigo-500 hover:text-white transition duration-300"
                  >
                    <UserCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Your Profile
                  </Disclosure.Button>
                  <Disclosure.Button
                    as="button"
                    onClick={handleSignOut}
                    className="flex items-center w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-indigo-500 hover:text-white transition duration-300"
                  >
                    <XMarkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                    Sign out
                  </Disclosure.Button>
                </div>
              )}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
}
