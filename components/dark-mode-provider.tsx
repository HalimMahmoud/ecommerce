'use client';

import { useEffect } from 'react';
import { useUI } from '@/lib/contexts/ui-context';

export default function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const { darkMode } = useUI();

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return <>{children}</>;
}
