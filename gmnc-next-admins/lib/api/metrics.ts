export type SystemMetrics = {
  totalUsers?: number;
  activeUsers?: number;
  totalPatients?: number;
  totalProviders?: number;
  totalAssessments?: number;
  totalTasks?: number;
  platformAdherenceRate?: number;
  verifiedProviders?: number;
  openSupportTickets?: number;
  carePlanAdherence?: number | string;
  pendingApprovals?: number;
  providerVerification?: {
    verified?: number;
    pending?: number;
    flagged?: number;
  };
  improvementTrend?: Array<{ name: string; improvement: number }>;
  dailyTasks?: Array<{ name: string; assigned: number }>;
  patientRecovery?: Array<{
    label: string;
    value: string;
    note: string;
    color: string;
  }>;
  [key: string]: unknown;
};

export async function getSystemMetrics(filter?: string): Promise<SystemMetrics> {
  try {
    const url = filter
      ? `/api/metrics/system?filter=${encodeURIComponent(filter)}`
      : '/api/metrics/system';
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    });

    const json = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        json?.message ||
        json?.error ||
        `Failed to load system metrics (${response.status})`;
      throw new Error(String(message));
    }

    if (!json) {
      throw new Error('Empty response from metrics endpoint');
    }

    const payload = json as { data?: SystemMetrics } | SystemMetrics;
    const metrics = (payload as { data?: SystemMetrics }).data ?? (payload as SystemMetrics);

    if (!metrics || typeof metrics !== 'object') {
      throw new Error('Invalid metrics data structure');
    }

    return metrics;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch system metrics';
    console.error('[getSystemMetrics] Error:', message);
    throw error;
  }
}

export async function triggerSystemMetricsComputation(): Promise<{ success: boolean; message?: string }> {
  const response = await fetch('/api/metrics/compute/system', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Failed to compute system metrics (${response.status})`;
    throw new Error(String(message));
  }

  return json as { success: boolean; message?: string };
}

export async function triggerFullMetricsComputation(): Promise<{ success: boolean; message?: string }> {
  const response = await fetch('/api/metrics/compute/all', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Failed to compute all metrics (${response.status})`;
    throw new Error(String(message));
  }

  return json as { success: boolean; message?: string };
}
