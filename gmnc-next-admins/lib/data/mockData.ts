export const ADMIN_STATS = [
  { title: 'Total Patients', value: '12,482', change: 12, trend: 'up' as const, description: 'vs last month' },
  { title: 'Active Subscriptions', value: '8,291', change: 8, trend: 'up' as const, description: 'vs last month' },
  { title: 'Revenue (MTD)', value: '$452,102', change: 15, trend: 'up' as const, description: 'vs last month' },
  { title: 'Open Tickets', value: '24', change: 5, trend: 'down' as const, description: 'vs last month' },
];

export const REVENUE_DATA = [
  { name: 'Jan', revenue: 320000, subscriptions: 2100 },
  { name: 'Feb', revenue: 350000, subscriptions: 2300 },
  { name: 'Mar', revenue: 310000, subscriptions: 2000 },
  { name: 'Apr', revenue: 380000, subscriptions: 2500 },
  { name: 'May', revenue: 420000, subscriptions: 2800 },
  { name: 'Jun', revenue: 452102, subscriptions: 3100 },
];

export const ALERTS = [
  { id: 1, type: 'danger', message: 'Failed payments detected (12)', time: '10 mins ago' },
  { id: 2, type: 'warning', message: 'System error in API gateway', time: '45 mins ago' },
  { id: 3, type: 'info', message: 'SLA breach: Ticket #4521', time: '2 hours ago' },
];

export const AUDIT_LOGS = [
  { id: '1', user: 'Admin User', action: 'Modified system permissions', timestamp: '2026-04-25 10:15', status: 'Success' },
  { id: '2', user: 'Dr. Sarah Adams', action: 'Accessed patient record #P-4521', timestamp: '2026-04-25 09:45', status: 'Success' },
  { id: '3', user: 'Support Agent', action: 'Resolved ticket #T-8291', timestamp: '2026-04-25 08:30', status: 'Success' },
  { id: '4', user: 'Unknown', action: 'Multiple failed login attempts', timestamp: '2026-04-25 04:12', status: 'Blocked' },
];

export const PROVIDER_STATS = [
  { title: "Today's Appointments", value: '8', change: 2, trend: 'up' as const },
  { title: 'Completed Sessions', value: '42', change: 10, trend: 'up' as const },
  { title: 'Clinical Earnings', value: '$8,240', change: 5, trend: 'up' as const },
];

export const APPOINTMENTS = [
  { id: '1', patient: 'Leo Chen', time: '14:00', condition: 'Cerebral Palsy', status: 'Upcoming' },
  { id: '2', patient: 'Emma Watson', time: '15:30', condition: 'Multiple Sclerosis', status: 'Confirmed' },
  { id: '3', patient: 'John Doe', time: '10:00', condition: 'Stroke Recovery', status: 'Completed' },
];

export const TICKETS = [
  { id: 'T-8291', user: 'Alice Smith', issue: 'Cannot access report', priority: 'High', status: 'Open' },
  { id: 'T-8292', user: 'Bob Wilson', issue: 'Payment failed', priority: 'Medium', status: 'In Progress' },
  { id: 'T-8293', user: 'Charlie Brown', issue: 'App crashing on iOS', priority: 'Critical', status: 'Escalated' },
];

export const SYSTEM_STATUS = [
  { label: 'API Gateway', status: 'Operational', color: 'bg-emerald-500' },
  { label: 'Database Cluster', status: 'Operational', color: 'bg-emerald-500' },
  { label: 'Authentication Service', status: 'Operational', color: 'bg-emerald-500' },
  { label: 'Storage Service', status: 'Operational', color: 'bg-emerald-500' },
];
