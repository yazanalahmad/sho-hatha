import { createContext, useReducer, type Dispatch, type ReactNode } from 'react';
import { gameReducer, initialGameState } from './game-reducer';
import { initialTimerState, timerReducer } from './timer-reducer';
import type { GameAction, GameState, TimerAction, TimerState } from './types';

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  timerState: TimerState;
  timerDispatch: Dispatch<TimerAction>;
}

export const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [timerState, timerDispatch] = useReducer(timerReducer, initialTimerState);

  return (
    <GameContext.Provider value={{ state, dispatch, timerState, timerDispatch }}>
      {children}
    </GameContext.Provider>
  );
}
