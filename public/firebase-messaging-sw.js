// Scripts for firebase and firebase-messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Parse Firebase config from query parameters to keep API keys secure and dynamic
const urlParams = new URLSearchParams(self.location.search);
const firebaseConfig = {
  apiKey: urlParams.get('apiKey') || '',
  authDomain: urlParams.get('authDomain') || '',
  projectId: urlParams.get('projectId') || '',
  storageBucket: urlParams.get('storageBucket') || '',
  messagingSenderId: urlParams.get('messagingSenderId') || '',
  appId: urlParams.get('appId') || ''
};

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp(firebaseConfig);

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

// Handle notification clicks to open or focus the app window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Get destination URL from notification data, fallback to root
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the same origin
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            if (focusedClient && 'navigate' in focusedClient) {
              return focusedClient.navigate(urlToOpen);
            }
          });
        }
      }
      // If no window/tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

