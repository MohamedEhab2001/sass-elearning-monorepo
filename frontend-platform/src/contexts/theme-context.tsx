'use client';

/**
 * Theme Context
 * Provides dynamic theming throughout the application
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig, defaultTheme, applyTheme } from '@/lib/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  setTheme: (theme: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);

  useEffect(() => {
    // Apply theme on mount and when it changes
    applyTheme(theme);
  }, [theme]);

  const setTheme = (newTheme: Partial<ThemeConfig>) => {
    setThemeState((prev) => ({
      ...prev,
      ...newTheme,
      colors: { ...prev.colors, ...newTheme.colors },
      branding: { ...prev.branding, ...newTheme.branding },
      fonts: { ...prev.fonts, ...newTheme.fonts },
    }));
  };

  const resetTheme = () => {
    setThemeState(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
