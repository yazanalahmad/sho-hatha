import type { TimerAction, TimerState } from './types';

export const initialTimerState: TimerState = {
  status: 'idle',
  durationSeconds: 0,
  remainingMs: 0,
  startedAtMs: null,
  pausedAtMs: null,
  freezeExpiresAtMs: null,
};

function getRemainingMs(state: TimerState, nowMs: number): number {
  if (!state.startedAtMs) {
    return state.remainingMs;
  }

  const elapsed = nowMs - state.startedAtMs;
  return Math.max(0, state.durationSeconds * 1000 - elapsed);
}

export function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START': {
      const nowMs = action.nowMs ?? Date.now();
      return {
        status: 'running',
        durationSeconds: action.durationSeconds,
        remainingMs: action.durationSeconds * 1000,
        startedAtMs: nowMs,
        pausedAtMs: null,
        freezeExpiresAtMs: null,
      };
    }

    case 'TICK': {
      if (state.status === 'idle' || state.status === 'paused' || state.status === 'expired') {
        return state;
      }

      if (!state.startedAtMs) {
        return state;
      }

      if (state.freezeExpiresAtMs && action.nowMs < state.freezeExpiresAtMs) {
        return { ...state, status: 'frozen' };
      }

      const remaining = getRemainingMs(state, action.nowMs);
      return {
        ...state,
        remainingMs: remaining,
        freezeExpiresAtMs: null,
        status: remaining === 0 ? 'expired' : 'running',
      };
    }

    case 'PAUSE': {
      if (state.status !== 'running' && state.status !== 'frozen') {
        return state;
      }
      return {
        ...state,
        status: 'paused',
        remainingMs: getRemainingMs(state, action.nowMs),
        pausedAtMs: action.nowMs,
        freezeExpiresAtMs: null,
      };
    }

    case 'RESUME': {
      if (state.status !== 'paused' || !state.pausedAtMs) {
        return state;
      }

      const pausedDuration = action.nowMs - state.pausedAtMs;
      return {
        ...state,
        status: 'running',
        startedAtMs: state.startedAtMs ? state.startedAtMs + pausedDuration : action.nowMs,
        pausedAtMs: null,
      };
    }

    case 'FREEZE': {
      if (state.status !== 'running' || !state.startedAtMs) {
        return state;
      }

      const freezeMs = action.durationSeconds * 1000;
      return {
        ...state,
        status: 'frozen',
        freezeExpiresAtMs: action.nowMs + freezeMs,
        startedAtMs: state.startedAtMs + freezeMs,
      };
    }

    case 'RESET':
      return initialTimerState;

    default:
      return state;
  }
}
