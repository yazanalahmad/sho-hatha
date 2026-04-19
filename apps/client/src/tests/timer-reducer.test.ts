import { describe, expect, it } from 'vitest';
import { initialTimerState, timerReducer } from '../state/timer-reducer';

describe('timerReducer', () => {
  it('START creates running state with correct duration', () => {
    const state = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    expect(state.status).toBe('running');
    expect(state.remainingMs).toBe(30000);
  });

  it('TICK decrements remaining time based on elapsed ms', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    const ticked = timerReducer(started, { type: 'TICK', nowMs: 4000 });
    expect(ticked.remainingMs).toBe(27000);
  });

  it('TICK sets status to expired when remainingMs reaches 0', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 1, nowMs: 1000 });
    const ticked = timerReducer(started, { type: 'TICK', nowMs: 2500 });
    expect(ticked.status).toBe('expired');
  });

  it('FREEZE sets status to frozen and extends effective start time', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    const frozen = timerReducer(started, { type: 'FREEZE', durationSeconds: 10, nowMs: 2000 });
    expect(frozen.status).toBe('frozen');
    expect(frozen.startedAtMs).toBe(11000);
  });

  it('TICK during frozen period does not decrement time', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    const frozen = timerReducer(started, { type: 'FREEZE', durationSeconds: 10, nowMs: 2000 });
    const ticked = timerReducer(frozen, { type: 'TICK', nowMs: 9000 });
    expect(ticked.status).toBe('frozen');
  });

  it('PAUSE sets pausedAtMs', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    const paused = timerReducer(started, { type: 'PAUSE', nowMs: 2000 });
    expect(paused.status).toBe('paused');
    expect(paused.pausedAtMs).toBe(2000);
  });

  it('RESUME adjusts startedAtMs to account for paused duration', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    const paused = timerReducer(started, { type: 'PAUSE', nowMs: 2000 });
    const resumed = timerReducer(paused, { type: 'RESUME', nowMs: 5000 });
    expect(resumed.startedAtMs).toBe(4000);
  });

  it('RESET returns to idle state', () => {
    const started = timerReducer(initialTimerState, { type: 'START', durationSeconds: 30, nowMs: 1000 });
    const reset = timerReducer(started, { type: 'RESET' });
    expect(reset).toEqual(initialTimerState);
  });
});
