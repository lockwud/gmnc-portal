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

/**
 * Returns the effective roles for a user.
 * Only uses explicitly assigned roles from the backend — does NOT
 * inject a default role based on userType.  This ensures that when
 * an admin revokes a role, the user truly has no role until one is
 * re-assigned via the RBAC admin panel.
 */
export function getEffectiveRoles(user: User): Role[] {
  return user.roles
    .map((role) => role.trim().toLowerCase() as Role)
    .filter((role) => BUILT_IN_ROLES.has(role));
}

export function hasRole(user: User, role: Role): boolean {
  if (getEffectiveRoles(user).includes(role.toLowerCase() as Role)) return true;

  // Fallback: infer role from userType (e.g. SERVICE_PROVIDER → provider)
  const defaultRole = getDefaultRoleForUserType(user.userType);
  if (defaultRole && defaultRole.toLowerCase() === role.toLowerCase()) return true;

  return false;
}

/**
 * Returns true if the user has any assigned RBAC role (from the backend).
 */
export function hasAnyRole(user: User): boolean {
  return getEffectiveRoles(user).length > 0;
}

export function hasWorkspaceAccess(user: User, role: Role): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'tester') || hasRole(user, role);
}

function pathMatches(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessDashboardPath(user: User, pathname: string): boolean {
  const effectiveRoles = getEffectiveRoles(user);

  // Admin and tester can access any dashboard path
  if (effectiveRoles.includes('admin') || effectiveRoles.includes('tester')) {
    return true;
  }

  // Common pages accessible to all authenticated users
  if (
    pathMatches(pathname, '/dashboard') ||
    pathMatches(pathname, '/profile') ||
    pathMatches(pathname, '/notifications')
  ) {
    return true;
  }

  // SERVICE_PROVIDER userType gets access to provider workspace even without an assigned role
  const isServiceProvider = (user.userType || '').toUpperCase() === 'SERVICE_PROVIDER';
  if (isServiceProvider) {
    if (
      pathMatches(pathname, '/provider') ||
      pathMatches(pathname, '/support/tickets') ||
      pathMatches(pathname, '/support/faqs') ||
      pathMatches(pathname, '/settings')
    ) {
      return true;
    }
  }

  if (effectiveRoles.length === 0) return false;

  // Allow user-facing support pages for providers
  if (
    pathMatches(pathname, '/support/tickets') ||
    pathMatches(pathname, '/support/faqs')
  ) {
    if (effectiveRoles.includes('provider')) {
      return true;
    }
  }

  if (pathMatches(pathname, '/provider')) return effectiveRoles.includes('provider');
  if (pathMatches(pathname, '/support')) return effectiveRoles.includes('support');
  if (pathMatches(pathname, '/settings')) return effectiveRoles.includes('provider');
  if (pathMatches(pathname, '/reports')) return effectiveRoles.includes('provider');

  return false;
}

// =========================================
// PERMISSION GUARD
// =========================================
export function hasPermission(user: User, permission: Permission): boolean {
  if (user.permissions.includes(permission)) return true;

  // Check both explicitly assigned roles and userType-inferred role
  const effectiveRoles = getEffectiveRoles(user);
  const defaultRole = getDefaultRoleForUserType(user.userType);
  const allRoles = defaultRole && !effectiveRoles.includes(defaultRole)
    ? [...effectiveRoles, defaultRole]
    : effectiveRoles;

  return allRoles.some((role) =>
    ROLE_PERMISSIONS[role]?.includes(permission),
  );
}
