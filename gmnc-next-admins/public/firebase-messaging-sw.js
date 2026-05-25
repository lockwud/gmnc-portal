// Firebase Cloud Messaging service worker
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBaFxxNQ7Hc9i-pOmYyFplx0cRQFGzsEhY",
  authDomain: "gmnc-94865.firebaseapp.com",
  projectId: "gmnc-94865",
  storageBucket: "gmnc-94865.appspot.com",
  messagingSenderId: "662648667940",
  appId: "1:662648667940:web:58597247259c30c89a7db1",
  measurementId: "G-96T187L67N"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// VAPID key - replace with your actual key
const VAPID_KEY = self.NEXT_PUBLIC_FIREBASE_VAPID_KEY || "BB6MYyNjjjGl9bHmXlyILE3pp9JPFuNDvZhFxHYYc0VrZmKPLN0SMoUAITu9XZXtpMZOtq3FCfFsQGBhibzkMbY";

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