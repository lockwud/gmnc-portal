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

const USER_TYPE_ROLES: Record<string, Role> = {
  ADMIN: 'admin',
  SERVICE_PROVIDER: 'provider',
};

const BUILT_IN_ROLES = new Set<Role>([
  'admin',
  'provider',
  'support',
  'tester',
]);

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
    default:
      return '/dashboard';
  }
}

// =========================================
// ACCESS HELPERS
// =========================================
export function getDefaultRoleForUserType(userType?: string | null): Role | null {
  if (!userType) return null;
  return USER_TYPE_ROLES[userType.trim().toUpperCase()] ?? null;
}

export function getEffectiveRoles(user: User): Role[] {
  const roles = user.roles
    .map((role) => role.trim().toLowerCase() as Role)
    .filter((role) => BUILT_IN_ROLES.has(role));
  const defaultRole = getDefaultRoleForUserType(user.userType);

  return [...new Set(defaultRole ? [...roles, defaultRole] : roles)];
}

export function hasRole(user: User, role: Role): boolean {
  return getEffectiveRoles(user).includes(role.toLowerCase() as Role);
}

export function hasWorkspaceAccess(user: User, role: Role): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'tester') || hasRole(user, role);
}

function pathMatches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessDashboardPath(user: User, pathname: string): boolean {
  if (
    pathMatches(pathname, '/dashboard')
    || pathMatches(pathname, '/profile')
    || pathMatches(pathname, '/notifications')
  ) {
    return true;
  }

  if (hasRole(user, 'admin') || hasRole(user, 'tester')) {
    return true;
  }

  // Allow user-facing support pages for service providers and caregivers
  // while keeping the top-level /support dashboard restricted to support role.
  if (
    pathMatches(pathname, '/support/tickets') ||
    pathMatches(pathname, '/support/faqs')
  ) {
    if (
      hasRole(user, 'admin') ||
      hasRole(user, 'tester') ||
      hasRole(user, 'provider')
    ) {
      return true;
    }
  }

  if (pathMatches(pathname, '/provider')) return hasRole(user, 'provider');
  if (pathMatches(pathname, '/support')) return hasRole(user, 'support');
  if (pathMatches(pathname, '/settings')) return hasRole(user, 'provider');
  if (pathMatches(pathname, '/reports')) return hasRole(user, 'provider');

  return false;
}

// =========================================
// PERMISSION GUARD
// =========================================
export function hasPermission(user: User, permission: Permission): boolean {
  if (user.permissions.includes(permission)) return true;

  return getEffectiveRoles(user).some((role) =>
    ROLE_PERMISSIONS[role]?.includes(permission),
  );
}
