import ProviderDetailPage from '@/components/admin/ProviderDetailPage';

export default async function AdminProviderDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProviderDetailPage providerId={id} />;
}