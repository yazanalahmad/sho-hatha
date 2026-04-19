import type { ReactNode } from 'react';
import { GameProvider } from '../state/game-context';

export function AppProviders({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}
