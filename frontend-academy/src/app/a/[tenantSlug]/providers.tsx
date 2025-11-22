'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, createContext, useContext } from 'react';

const queryClient = new QueryClient();

interface TenantBranding {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

const TenantContext = createContext<{
  tenantSlug: string;
  branding: TenantBranding;
}>({
  tenantSlug: '',
  branding: {
    name: 'منصة التعليم',
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    accentColor: '#EC4899',
  },
});

export const useTenant = () => useContext(TenantContext);

export function Providers({
  children,
  tenantSlug,
}: {
  children: React.ReactNode;
  tenantSlug: string;
}) {
  const [branding, setBranding] = useState<TenantBranding>({
    name: 'منصة التعليم',
    primaryColor: '#6366F1',
    secondaryColor: '#8B5CF6',
    accentColor: '#EC4899',
  });

  useEffect(() => {
    // Fetch tenant branding from API
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenants/slug/${tenantSlug}`)
      .then((res) => res.json())
      .then((tenant) => {
        if (tenant.branding) {
          setBranding({
            name: tenant.name || 'منصة التعليم',
            logo: tenant.branding.logo,
            primaryColor: tenant.branding.primaryColor || '#6366F1',
            secondaryColor: tenant.branding.secondaryColor || '#8B5CF6',
            accentColor: tenant.branding.accentColor || '#EC4899',
          });

          // Apply branding colors to CSS variables
          const root = document.documentElement;
          root.style.setProperty('--color-primary', hexToRgb(tenant.branding.primaryColor || '#6366F1'));
          root.style.setProperty('--color-secondary', hexToRgb(tenant.branding.secondaryColor || '#8B5CF6'));
          root.style.setProperty('--color-accent', hexToRgb(tenant.branding.accentColor || '#EC4899'));
        }
      })
      .catch((err) => console.error('Failed to load tenant branding:', err));
  }, [tenantSlug]);

  return (
    <QueryClientProvider client={queryClient}>
      <TenantContext.Provider value={{ tenantSlug, branding }}>
        {children}
      </TenantContext.Provider>
    </QueryClientProvider>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '99, 102, 241';
  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}
