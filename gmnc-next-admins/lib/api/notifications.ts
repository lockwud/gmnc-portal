import { apiClient } from "./client";

export type PushTokenRegisterPayload = {
  token: string;
  deviceType?: string;
  deviceId?: string;
};

export type PushTokenResponse = {
  token: string | null;
};

export async function getPushToken(token?: string): Promise<PushTokenResponse> {
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