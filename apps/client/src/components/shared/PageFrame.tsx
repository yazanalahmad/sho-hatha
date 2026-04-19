import type { ReactNode } from 'react';
import { LanguageToggle } from '../setup/LanguageToggle';
import { ThemeToggle } from './ThemeToggle';

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-6 md:px-6">
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <LanguageToggle />
        <ThemeToggle />
      </div>
      <div className="mx-auto max-w-[1220px] space-y-5">
        {children}
      </div>
    </div>
  );
}
