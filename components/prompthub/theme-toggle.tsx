'use client';

import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/prompthub/ui/button';
import { useTheme } from './theme-provider';

export function ThemeToggle() {
  const { resolved, setPreference } = useTheme();
  const next = resolved === 'dark' ? 'light' : 'dark';
  const Icon = resolved === 'dark' ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setPreference(next)}
      aria-label={next === 'dark' ? 'ダークモードに切り替える' : 'ライトモードに切り替える'}
      title={next === 'dark' ? 'ダークモード' : 'ライトモード'}
    >
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
    </Button>
  );
}
