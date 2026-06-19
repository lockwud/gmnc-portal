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
  type NotificationApiResponse = {
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
  };

  const res = await apiClient<NotificationApiResponse>("/notification?limit=50", {
    method: "GET",
    token,
  });

  const apiData = res.data;
  const innerData = typeof apiData.data === 'object' && !Array.isArray(apiData.data)
    ? apiData.data
    : null;
  const notifications = Array.isArray(apiData.data) ? apiData.data : innerData?.data ?? [];

  return {
    notifications,
    total: apiData.total || innerData?.pagination?.total || notifications.length,
    page: apiData.page || innerData?.pagination?.page,
    pageSize: apiData.pageSize || innerData?.pagination?.limit,
  };
}

export async function getUnreadNotificationCount(token?: string | null): Promise<number> {
  const res = await apiClient<{ status: boolean; data: { count?: number }; message?: string }>("/notification/unread-count", {
    method: "GET",
    token,
  });
  return typeof res.data.data?.count === 'number' ? res.data.data.count : 0;
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
