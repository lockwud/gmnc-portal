export type Role = 'admin' | 'provider' | 'support' | 'tester' | 'caregiver';

export type Permission = 
  | 'appointment.read' 
  | 'appointment.write' 
  | 'telehealth.start' 
  | 'telehealth.join'
  | 'system.manage' 
  | 'support.read' 
  | 'tester.all'
  | 'caregiver.read';

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  avatar?: string;
}

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['appointment.read', 'appointment.write', 'system.manage', 'support.read', 'caregiver.read'],
  provider: ['appointment.read', 'appointment.write', 'telehealth.start', 'support.read', 'caregiver.read'],
  support: ['appointment.read', 'support.read'],
  tester: ['tester.all', 'appointment.read', 'appointment.write', 'system.manage', 'support.read', 'caregiver.read', 'telehealth.start', 'telehealth.join'],
  caregiver: ['appointment.read', 'telehealth.join', 'caregiver.read'],
};

export function getDashboardRoute(role: Role): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'provider':
      return '/provider';
    case 'support':
      return '/support';
    case 'tester':
      return '/tester';
    case 'caregiver':
      return '/caregiver';
    default:
      return '/dashboard';
  }
}

export function hasPermission(user: User, permission: Permission): boolean {
  return user.permissions.includes(permission);
}
