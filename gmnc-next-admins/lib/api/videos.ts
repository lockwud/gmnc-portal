import { requireApiBaseUrl } from '@/lib/env';

const API_BASE_URL = requireApiBaseUrl();

async function parseJson<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(json?.message || json?.error || `Request failed with status ${res.status}`);
  }
  return json as T;
}

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || localStorage.getItem('gmnc_token');
  }
  return null;
}

export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  duration?: string;
  [key: string]: unknown;
}

export interface VideoListResponse {
  status: string;
  data: {
    videos: VideoItem[];
    nextPageToken?: string;
    totalResults?: number;
  };
  message?: string;
}

export async function getVideos(params?: {
  pageSize?: number;
  pageToken?: string;
  order?: 'date' | 'rating' | 'relevance' | 'title' | 'viewCount';
}): Promise<VideoListResponse> {
  const token = getToken();
  const query = new URLSearchParams();
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.pageToken) query.set('pageToken', params.pageToken);
  if (params?.order) query.set('order', params.order);

  const url = `${API_BASE_URL}/user/videos${query.toString() ? `?${query}` : ''}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    cache: 'no-store',
  });

  return parseJson<VideoListResponse>(res);
}
