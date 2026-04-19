import { useEffect, type Dispatch } from 'react';
import type { TimerAction } from '../state/types';

export function useTimer(timerDispatch: Dispatch<TimerAction>) {
  useEffect(() => {
    const id = window.setInterval(() => {
      timerDispatch({ type: 'TICK', nowMs: Date.now() });
    }, 100);

    return () => window.clearInterval(id);
  }, [timerDispatch]);
}
