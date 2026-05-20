import AppointmentsSkeleton from './AppointmentsSkeleton';
import ProvidersSkeleton from './ProvidersSkeleton';
import DashboardSkeleton from './DashboardSkeleton';
import AdminDashboardSkeleton from './AdminDashboardSkeleton';
import ReferralsSkeleton from './ReferralsSkeleton';

export type SkeletonType = 'appointments' | 'providers' | 'dashboard' | 'adminDashboard' | 'referrals' | 'default';

export const SKELETON_COMPONENTS: Record<SkeletonType, React.ComponentType> = {
  appointments: AppointmentsSkeleton,
  providers: ProvidersSkeleton,
  dashboard: DashboardSkeleton,
  adminDashboard: AdminDashboardSkeleton,
  referrals: ReferralsSkeleton,
  default: DashboardSkeleton,
};

export function getSkeletonType(pathname: string): SkeletonType {
  if (pathname.includes('/provider/appointments')) {
    return 'appointments';
  }
  if (pathname.includes('/admin/providers')) {
    return 'providers';
  }
  if (pathname.includes('/admin/referrals')) {
    return 'referrals';
  }
  if (pathname === '/dashboard' || pathname === '/(dashboard)/dashboard') {
    return 'dashboard';
  }
  if (pathname.startsWith('/admin')) {
    return 'adminDashboard';
  }
  return 'default';
}