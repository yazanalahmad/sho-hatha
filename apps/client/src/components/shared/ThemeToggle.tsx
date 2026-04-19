import { useEffect, useMemo, useState } from 'react';

type ThemeMode = 'dark' | 'light';

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  const stored = window.localStorage.getItem('sho-hatha-theme');
  if (stored === 'light' || stored === 'dark') return stored;
  return 'dark';
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('sho-hatha-theme', theme);
  }, [theme]);

  const nextTheme = useMemo<ThemeMode>(() => (theme === 'dark' ? 'light' : 'dark'), [theme]);

  return (
    <button
      type="button"
      className="min-w-[92px] border border-gold-muted px-3 py-2 text-sm font-score tracking-wide text-[color:var(--text-primary)] bg-[color:var(--bg-surface)] transition-colors hover:border-gold hover:bg-[color:var(--bg-card)]"
      onClick={() => setTheme(nextTheme)}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
