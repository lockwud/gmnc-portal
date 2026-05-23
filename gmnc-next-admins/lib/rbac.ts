// =========================================
// RBAC — types, helpers, and route mapping
// =========================================

// Use a loose Role type so API string values ("admin", "provider", …)
// satisfy it without needing a cast everywhere.
export type Role =
  | 'admin'
  | 'provider'
  | 'support'
  | 'tester'
  | 'caregiver'
  | (string & Record<never, never>); // allows arbitrary strings from the API

export type Permission =
  | 'appointment.read'
  | 'appointment.write'
  | 'telehealth.start'
  | 'telehealth.join'
  | 'system.manage'
  | 'support.read'
  | 'tester.all'
  | 'caregiver.read'
  | (string & Record<never, never>); // allows arbitrary permissions from the API

// User shape that matches the real API login/me response
export interface User {
  id: string;
  /** Raw name field returned by the API */
  name?: string;
  /** Alias used by many UI components */
  fullName?: string;
  email: string;
  /** User type string from the API, e.g. "ADMIN", "SERVICE_PROVIDER" */
  userType?: string;
  /** Array of role slugs, e.g. ["admin"] */
  roles: string[];
  /** Array of permission codes, e.g. ["users.list", "rbac.manage"] */
  permissions: string[];
  avatar?: string | null;
}

// =========================================
// ROLE → PERMISSION MAP (frontend defaults)
// This is used as a fallback; real permissions come from the API.
// =========================================
export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'appointment.read',
    'appointment.write',
    'telehealth.start',
    'system.manage',
    'support.read',
    'caregiver.read',
  ],
  provider: [
    'appointment.read',
    'appointment.write',
    'telehealth.start',
    'support.read',
    'caregiver.read',
  ],
  support: ['appointment.read', 'support.read'],
  tester: [
    'tester.all',
    'appointment.read',
    'appointment.write',
    'system.manage',
    'support.read',
    'caregiver.read',
    'telehealth.start',
    'telehealth.join',
  ],
  caregiver: ['appointment.read', 'telehealth.join', 'caregiver.read'],
};

// =========================================
// ROUTE HELPER
// =========================================
export function getDashboardRoute(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'provider':
      return '/provider';
    case 'support':
      return '/support';
    case 'tester':
      return '/dashboard';
    case 'caregiver':
      return '/caregiver';
    default:
      return '/dashboard';
  }
}

// =========================================
// PERMISSION GUARD
// =========================================
export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

export function hasRole(user: User, role: Role): boolean {
  return user.roles.includes(role);
}