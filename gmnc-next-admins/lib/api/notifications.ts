import { apiClient } from "./client";
import type { PushTokenRegisterPayload } from "./types";
import type { NotificationItem, NotificationListResponse } from "./types";

export async function getPushToken(token?: string): Promise<{ token: string | null }> {
  const res = await apiClient<{ token: string | null }>("/notification/push-token", {
    method: "GET",
    token,
  });
  return res.data;
}

export async function registerPushToken(payload: PushTokenRegisterPayload, token?: string): Promise<void> {
  await apiClient("/notification/push-token", {
    method: "POST",
    body: payload,
    token,
  });
}

export async function removePushToken(token?: string): Promise<void> {
  await apiClient("/notification/push-token", {
    method: "DELETE",
    token,
  });
}

export async function getNotifications(token?: string | null): Promise<NotificationListResponse> {
  const res = await apiClient<{
    status: boolean;
    message?: string;
    data: NotificationItem[] | {
      data?: NotificationItem[];
      pagination?: {
        total?: number;
        page?: number;
        limit?: number;
      };
    };
    total?: number;
    page?: number;
    pageSize?: number;
  }>("/notification?limit=50", {
    method: "GET",
    token,
  });

  const nestedData = typeof res.data === 'object' && !Array.isArray(res.data) ? res.data : null;
  const notifications = Array.isArray(res.data) ? res.data : nestedData?.data ?? [];

  return {
    notifications,
    total: res.total || nestedData?.pagination?.total || notifications.length,
    page: res.page || nestedData?.pagination?.page,
    pageSize: res.pageSize || nestedData?.pagination?.limit,
  };
}

export async function getUnreadNotificationCount(token?: string | null): Promise<number> {
  const res = await apiClient<{ status: boolean; data: { count?: number }; message?: string }>("/notification/unread-count", {
    method: "GET",
    token,
  });
  return typeof res.data?.count === 'number' ? res.data.count : 0;
}

export async function markNotificationAsRead(id: string, token?: string | null): Promise<void> {
  await apiClient(`/notification/${id}/read`, {
    method: "PUT",
    token,
  });
}

export async function markAllNotificationsAsRead(token?: string | null): Promise<void> {
  await apiClient("/notification/read-all", {
    method: "PUT",
    token,
  });
}
