import React, { useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging, db, auth } from '../firebase/config';
import { doc, arrayUnion } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { Bell, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * NotificationManager handles FCM token registration and foreground messages
 */
const NotificationManager = () => {
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    // If permission is default (not asked yet), show our custom professional modal
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowPermissionModal(true);
      }, 5000); // Wait 5 seconds before asking to be less intrusive
      return () => clearTimeout(timer);
    }

    if (Notification.permission === 'granted') {
      registerToken();
    }
  }, []);

  useEffect(() => {
    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      toast.info(
        <div className="flex flex-col">
          <span className="font-bold">{payload.notification.title}</span>
          <span className="text-sm">{payload.notification.body}</span>
        </div>,
        {
          icon: <Bell className="text-blue-500" />,
          position: "top-right",
          autoClose: 5000,
        }
      );
    });

    return () => unsubscribe();
  }, []);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setShowPermissionModal(false);
      
      if (permission === 'granted') {
        await registerToken();
        toast.success("Notifications enabled! You'll stay updated on your orders.");
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const registerToken = async () => {
    try {
      console.log('📢 NotificationManager: Starting token registration...');
      
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service workers are not supported in this browser');
      }

      // Construct the service worker URL with Firebase environment variables as query parameters to inject at runtime.
      const swParams = new URLSearchParams({
        apiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
        authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
        projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
        storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: process.env.REACT_APP_FIREBASE_APP_ID || ''
      }).toString();
      const swUrl = `/firebase-messaging-sw.js?${swParams}`;

      // We must ensure the service worker being used is actually the Firebase one,
      // not the default React app service worker which controls the root scope.
      let registrations = await navigator.serviceWorker.getRegistrations();
      let registration = registrations.find(reg => 
        reg.active && reg.active.scriptURL.includes('firebase-messaging-sw.js')
      );
      
      // If no registration exists, or if it exists but is using the legacy path without query params,
      // register/update it with the parameterized URL.
      if (!registration || !registration.active.scriptURL.includes('?apiKey=')) {
        console.log('📢 NotificationManager: Registering messaging service worker with environment parameters...');
        registration = await navigator.serviceWorker.register(swUrl, {
          scope: '/firebase-cloud-messaging-push-scope'
        });
        // Wait for it to be ready
        registration = await navigator.serviceWorker.ready;
      }

      console.log('✅ NotificationManager: Firebase Service worker is ready:', registration);

      // Use your VAPID key here
      const token = await getToken(messaging, { 
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('📢 NotificationManager: Token generated, saving to Firestore...');
        
        if (auth.currentUser) {
          // Logged-in user: Save to their user document
          const { setDoc } = await import('firebase/firestore');
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await setDoc(userRef, {
            fcmTokens: arrayUnion(token),
            notificationsEnabled: true,
            lastTokenUpdate: new Date().toISOString()
          }, { merge: true });
          console.log('✅ NotificationManager: Token saved to user profile:', auth.currentUser.uid);
        } else {
          // Guest user: Save to a global anonymous tokens collection so they still get broadcasts
          const { setDoc } = await import('firebase/firestore');
          const guestRef = doc(db, 'fcmTokens', token.substring(0, 20)); // Use part of token as ID
          await setDoc(guestRef, {
            token: token,
            createdAt: new Date().toISOString(),
            notificationsEnabled: true
          }, { merge: true });
          console.log('✅ NotificationManager: Token saved to anonymous collection');
        }
      } else {
        console.warn('⚠️ NotificationManager: No token generated');
      }
    } catch (error) {
      console.error('❌ NotificationManager: Error registering FCM token:', error);
    }
  };

  return (
    <AnimatePresence>
      {showPermissionModal && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-[9999] sm:max-w-sm w-auto sm:w-full bg-white rounded-2xl shadow-2xl border border-gray-100 p-6"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">Stay Updated</h3>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                Get real-time updates on your orders, exclusive offers, and price drops.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={requestPermission}
                  className="flex-1 bg-gray-900 text-white py-2 px-4 rounded-xl font-medium text-sm hover:bg-black transition-colors"
                >
                  Enable
                </button>
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 text-gray-500 font-medium text-sm hover:text-gray-700 transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowPermissionModal(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationManager;
