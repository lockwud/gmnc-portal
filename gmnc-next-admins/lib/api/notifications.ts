import { apiClient } from "./client";
import type { PushTokenRegisterPayload } from "./types";

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