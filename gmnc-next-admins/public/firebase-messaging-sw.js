// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: self.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: self.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: self.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: self.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: self.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: self.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: self.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// VAPID key - injected at build time from .env.local
// IMPORTANT: Service workers do not have access to process.env directly.
// You must inject the VAPID key at build time or use a placeholder replaced by your build tool.
const VAPID_KEY = self.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

if (!VAPID_KEY) {
  console.warn('VAPID key is not set. Please ensure NEXT_PUBLIC_FIREBASE_VAPID_KEY is injected at build time.');
}

messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification?.title || 'GMNC Notification';
  const notificationBody = payload.notification?.body || '';
  const notificationIcon = payload.notification?.icon || '/logo.png';
  
  const notificationOptions = {
    body: notificationBody,
    icon: notificationIcon,
    badge: '/badge-72x72.png',
    data: payload.data
  };

  return messaging.getMessage(function(remoteMessage) {
    console.log('Received background message:', remoteMessage);
    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
});