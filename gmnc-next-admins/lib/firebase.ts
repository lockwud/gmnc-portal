// Firebase initialization for GMNC Admin Web Portal
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken } from "firebase/messaging";
import { env } from "./env";

const firebaseConfig = {
  apiKey: "AIzaSyBaFxxNQ7Hc9i-pOmYyFplx0cRQFGzsEhY",
  authDomain: "gmnc-94865.firebaseapp.com",
  projectId: "gmnc-94865",
  storageBucket: "gmnc-94865.appspot.com",
  messagingSenderId: "662648667940",
  appId: "1:662648667940:web:58597247259c30c89a7db1",
  measurementId: "G-96T187L67N"
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAnalytics = getAnalytics(firebaseApp);

let messaging: ReturnType<typeof getMessaging> | null = null;

export function getMessagingInstance() {
  if (typeof window === "undefined") return null;
  if (!messaging) {
    messaging = getMessaging(firebaseApp);
  }
  return messaging;
}

const VAPID_KEY = env.FIREBASE_VAPID_KEY;

export async function getFCMToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const messagingInstance = getMessagingInstance();
  if (!messagingInstance) return null;

  if (!VAPID_KEY) {
    console.error("Firebase VAPID key not configured. Set NEXT_PUBLIC_FIREBASE_VAPID_KEY environment variable.");
    return null;
  }

  try {
    const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
    return token || null;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined") return "default";

  const permission = await Notification.requestPermission();
  return permission;
}