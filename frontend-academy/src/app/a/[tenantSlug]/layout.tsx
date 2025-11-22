import { Providers } from './providers';

export default function TenantLayout({
  children,
  params,
}: {
  children: React.Node;
  params: { tenantSlug: string };
}) {
  return (
    <Providers tenantSlug={params.tenantSlug}>
      <div className="min-h-screen bg-gray-50" dir="rtl">
        {children}
      </div>
    </Providers>
  );
}
