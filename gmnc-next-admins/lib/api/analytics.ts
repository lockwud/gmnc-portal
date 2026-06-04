export type AnalyticsFilter = 'today' | 'this_week' | 'this_month' | 'all_time';
export type AnalyticsScope = 'admin' | 'provider' | 'support';

export type AnalyticsFilterInput = AnalyticsFilter | 'Today' | 'This Week' | 'This Month' | 'All Time' | string;

export type WeeklyTrendPoint = {
  day: string;
  value: number;
};

export type AdminDashboardAnalytics = {
  kpis: {
    totalUsers: {
      count: number;
      activePercentage: number;
      newCount: number;
    };
    verifiedProviders: {
      count: number;
      pendingCount: number;
      flaggedCount: number;
    };
    openSupportTickets: {
      count: number;
      criticalCount: number;
      slaStatus: 'HEALTHY' | 'WARNING' | 'CRITICAL' | string;
    };
    carePlanAdherence: {
      onTrackPercentage: number;
      atRiskPercentage: number;
    };
    pendingApprovals: {
      queueCount: number;
    };
  };
  charts: {
    providerVerification: Array<{ status: string; count: number }>;
    cpImprovementTrend: WeeklyTrendPoint[];
    assignedDailyTasks: WeeklyTrendPoint[];
  };
};

export type ProviderDashboardAnalytics = {
  kpis: {
    sessionsCompleted: {
      count: number;
      averageRating: number;
    };
    referrals: {
      pending: number;
      approved: number;
      declined: number;
    };
    carePlanAdherence: {
      onTrackPercentage: number;
      atRiskPercentage: number;
    };
    assignedTasks: {
      open: number;
      done: number;
    };
    approvals: {
      pending: number;
      approved: number;
      rejected: number;
    };
  };
  charts: {
    patientProgress: WeeklyTrendPoint[];
    adherenceTrend: WeeklyTrendPoint[];
    assignedDailyTasks: WeeklyTrendPoint[];
    patientRecovery: {
      improved: number;
      stable: number;
      regressed: number;
    };
  };
};

export type SupportTicketMeta = {
  ticketId: string;
  time: string;
  issueType: string;
  description: string;
  usersInvolved: string[];
  priority: string;
};

export type SupportDashboardAnalytics = {
  kpis: {
    openQueue: {
      new: number;
      inProgress: number;
    };
    criticalEscalations: {
      count: number;
    };
    avgResponseTime: {
      goal: string;
      actual: string;
      slaHealth: 'HEALTHY' | 'WARNING' | 'BREACHED' | string;
    };
    resolvedToday: {
      efficiencyPercentage: number;
      backlogCount: number;
    };
  };
  queues: {
    newRequests: SupportTicketMeta[];
    inProgress: SupportTicketMeta[];
    escalated: SupportTicketMeta[];
  };
};

type AnalyticsByScope = {
  admin: AdminDashboardAnalytics;
  provider: ProviderDashboardAnalytics;
  support: SupportDashboardAnalytics;
};

export function normalizeAnalyticsFilter(filter?: AnalyticsFilterInput): AnalyticsFilter {
  switch (filter) {
    case 'today':
    case 'Today':
      return 'today';
    case 'this_month':
    case 'This Month':
      return 'this_month';
    case 'all_time':
    case 'All Time':
      return 'all_time';
    case 'this_week':
    case 'This Week':
    default:
      return 'this_week';
  }
}

async function getDashboardAnalytics<TScope extends AnalyticsScope>(
  scope: TScope,
  filter?: AnalyticsFilterInput,
): Promise<AnalyticsByScope[TScope]> {
  const normalizedFilter = normalizeAnalyticsFilter(filter);
  const response = await fetch(
    `/api/analytics/${scope}?filter=${encodeURIComponent(normalizedFilter)}`,
    {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
    },
  );

  const json = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      json?.message ||
      json?.error ||
      `Failed to load ${scope} analytics (${response.status})`;
    throw new Error(String(message));
  }

  const data = json?.data ?? json;

  if (!data || typeof data !== 'object') {
    throw new Error(`Invalid ${scope} analytics data structure`);
  }

  return data as AnalyticsByScope[TScope];
}

export function getAdminAnalytics(filter?: AnalyticsFilterInput) {
  return getDashboardAnalytics('admin', filter);
}

export function getProviderAnalytics(filter?: AnalyticsFilterInput) {
  return getDashboardAnalytics('provider', filter);
}

export function getSupportAnalytics(filter?: AnalyticsFilterInput) {
  return getDashboardAnalytics('support', filter);
}
