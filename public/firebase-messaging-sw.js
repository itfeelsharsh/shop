// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBu4Ihw8kgCm6NYeg2CQoy3wBdnAwTv7WM",
  authDomain: "kamikoto-shop.firebaseapp.com",
  projectId: "kamikoto-shop",
  storageBucket: "kamikoto-shop.firebasestorage.app",
  messagingSenderId: "90397336474",
  appId: "1:90397336474:web:61a089a41455b01b2fd023"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // If the payload contains a notification object, the FCM SDK will automatically 
  // display a notification. Manually calling showNotification here will cause duplicates.
  // We only need to manually show a notification if it's a data-only message.
  if (!payload.notification && payload.data) {
    const notificationTitle = payload.data.title || 'New Notification';
    const notificationOptions = {
      body: payload.data.body || '',
      icon: payload.data.icon || '/logo192.png',
      data: { url: payload.data.link || '/' }
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});

