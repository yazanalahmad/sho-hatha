import { useContext } from 'react';
import { GameContext } from '../state/game-context';

export function useGameContext() {
  const ctx = useContext(GameContext);
  if (!ctx) {
    throw new Error('useGameContext must be used within GameProvider');
  }

  return ctx;
}
