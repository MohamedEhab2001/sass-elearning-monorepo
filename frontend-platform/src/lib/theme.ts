/**
 * Theme Configuration System
 * Manages dynamic theming based on tenant/academy branding
 */

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
  };
  branding: {
    name: string;
    logo?: string;
    favicon?: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#3B82F6', // blue-500
    secondary: '#10B981', // green-500
    accent: '#F59E0B', // amber-500
    background: '#FFFFFF',
    foreground: '#111827', // gray-900
  },
  branding: {
    name: 'منصة الأكاديمية',
  },
  fonts: {
    heading: 'Cairo',
    body: 'Cairo',
  },
};

/**
 * Convert hex color to RGB values for CSS variables
 */
export function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '59, 130, 246'; // fallback to blue-500

  return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
}

/**
 * Apply theme to document root
 */
export function applyTheme(theme: Partial<ThemeConfig>) {
  const mergedTheme = { ...defaultTheme, ...theme };

  if (typeof window !== 'undefined') {
    const root = document.documentElement;

    // Apply color CSS variables
    if (mergedTheme.colors.primary) {
      root.style.setProperty('--color-primary', hexToRgb(mergedTheme.colors.primary));
    }
    if (mergedTheme.colors.secondary) {
      root.style.setProperty('--color-secondary', hexToRgb(mergedTheme.colors.secondary));
    }
    if (mergedTheme.colors.accent) {
      root.style.setProperty('--color-accent', hexToRgb(mergedTheme.colors.accent));
    }
  }
}

/**
 * Get theme from tenant settings
 */
export function getThemeFromTenant(tenant: any): Partial<ThemeConfig> {
  if (!tenant) return defaultTheme;

  return {
    colors: {
      primary: tenant.colors?.primary || defaultTheme.colors.primary,
      secondary: tenant.colors?.secondary || defaultTheme.colors.secondary,
      accent: defaultTheme.colors.accent,
      background: defaultTheme.colors.background,
      foreground: defaultTheme.colors.foreground,
    },
    branding: {
      name: tenant.name || defaultTheme.branding.name,
      logo: tenant.logo,
      favicon: tenant.favicon,
    },
    fonts: defaultTheme.fonts,
  };
}
