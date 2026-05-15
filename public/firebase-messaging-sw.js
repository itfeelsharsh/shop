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
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/logo192.png',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
