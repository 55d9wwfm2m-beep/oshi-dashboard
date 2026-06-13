'use client';

import { useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeColor] = useLocalStorage('oshi-theme-color', '196,164,160');

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', themeColor);
  }, [themeColor]);

  return <>{children}</>;
}
