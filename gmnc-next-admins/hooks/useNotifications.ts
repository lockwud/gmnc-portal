"use client";

import { useEffect, useState } from "react";
import { getFCMToken, requestNotificationPermission } from "@/lib/firebase";
import { registerPushToken, removePushToken } from "@/lib/api/notifications";
import { useAuth } from "@/lib/context/AuthContext";

export function useNotifications() {
  const { token } = useAuth();
  const [notifyToken, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      
      if (typeof window !== "undefined" && "serviceWorker" in navigator) {
        const permissionStatus = await requestNotificationPermission();
        setPermission(permissionStatus);

        if (permissionStatus === "granted") {
          const fcmToken = await getFCMToken();
          if (fcmToken) {
            setToken(fcmToken);
            await registerPushToken({ token: fcmToken, deviceType: "web" }, token);
          }
        }
      }
      
      setLoading(false);
    }

    init();
  }, [token]);

  const subscribe = async () => {
    setLoading(true);
    const permissionStatus = await requestNotificationPermission();
    setPermission(permissionStatus);

    if (permissionStatus === "granted") {
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        setToken(fcmToken);
        await registerPushToken({ token: fcmToken, deviceType: "web" }, token);
      }
    }
    setLoading(false);
  };

  const unsubscribe = async () => {
    if (notifyToken) {
      await removePushToken(token);
      setToken(null);
    }
  };

  return { token: notifyToken, permission, loading, subscribe, unsubscribe };
}