import { apiClient } from './client';
import type { GameListResponse, GameResource, GameSource, UpdateGamePayload } from './types';

type BackendListResponse = {
  data: GameResource[];
  pagination?: GameListResponse['pagination'];
};

type GameQuery = {
  source?: GameSource | 'ALL';
  tag?: string;
  page?: number;
  limit?: number;
};

function buildGameQuery(params: GameQuery = {}) {
  const search = new URLSearchParams();

  if (params.source && params.source !== 'ALL') search.set('source', params.source);
  if (params.tag) search.set('tag', params.tag);
  if (params.page) search.set('page', String(params.page));
  if (params.limit) search.set('limit', String(params.limit));

  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function getGames(token: string, params: GameQuery = {}): Promise<GameListResponse> {
  const res = await apiClient<BackendListResponse>(`/game${buildGameQuery(params)}`, { token });
  return {
    games: res.data.data ?? [],
    pagination: res.data.pagination,
  };
}

export async function createGame(formData: FormData, token: string): Promise<GameResource> {
  const res = await apiClient<{ data: GameResource }>('/game', {
    method: 'POST',
    body: formData,
    token,
    skipJsonStringify: true,
    timeoutMs: 60000,
  });
  return res.data.data;
}

export async function updateGame(
  id: string,
  payload: UpdateGamePayload,
  token: string,
): Promise<GameResource> {
  const res = await apiClient<{ data: GameResource }>(`/game/${id}`, {
    method: 'PATCH',
    body: payload,
    token,
  });
  return res.data.data;
}

export async function deleteGame(id: string, token: string): Promise<void> {
  await apiClient(`/game/${id}`, { method: 'DELETE', token });
}

export async function publishGame(id: string, token: string): Promise<GameResource> {
  const res = await apiClient<{ data: GameResource }>(`/game/${id}/publish`, {
    method: 'POST',
    token,
  });
  return res.data.data;
}

export async function unpublishGame(id: string, token: string): Promise<GameResource> {
  const res = await apiClient<{ data: GameResource }>(`/game/${id}/unpublish`, {
    method: 'POST',
    token,
  });
  return res.data.data;
}
