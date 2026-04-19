import { describe, expect, it } from 'vitest';
import { gameReducer, initialGameState } from '../state/game-reducer';
import { buildPack } from './test-data';

describe('gameReducer', () => {
  it('initializes with idle status', () => {
    expect(initialGameState.status).toBe('idle');
  });

  it('START_SETUP sets team names and timer duration', () => {
    const next = gameReducer(initialGameState, {
      type: 'START_SETUP',
      team1Name: 'A',
      team2Name: 'B',
      timerDuration: 30,
    });

    expect(next.team1.name).toBe('A');
    expect(next.team2.name).toBe('B');
    expect(next.timerDuration).toBe(30);
  });

  it('SET_TEAM_CATEGORIES stores category IDs for correct team', () => {
    const next = gameReducer(initialGameState, {
      type: 'SET_TEAM_CATEGORIES',
      team: 1,
      categoryIds: ['1', '2', '3'],
    });

    expect(next.team1.selectedCategoryIds).toEqual(['1', '2', '3']);
  });

  it('START_GAME transitions to playing with pack data', () => {
    const pack = buildPack();
    const next = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    expect(next.status).toBe('playing');
    expect(next.gamePack?.packId).toBe(pack.packId);
  });

  it('SUBMIT_ANSWER correct → adds points to current team', () => {
    const pack = buildPack();
    const started = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    const next = gameReducer(started, { type: 'SUBMIT_ANSWER', answerIndex: 1 });
    expect(next.team1.score).toBe(1);
  });

  it('SUBMIT_ANSWER wrong → adds 0 points', () => {
    const pack = buildPack();
    const started = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    const next = gameReducer(started, { type: 'SUBMIT_ANSWER', answerIndex: 0 });
    expect(next.team1.score).toBe(0);
  });

  it('SUBMIT_ANSWER null (timeout) → adds 0 points', () => {
    const pack = buildPack();
    const started = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    const next = gameReducer(started, { type: 'SUBMIT_ANSWER', answerIndex: null });
    expect(next.team1.score).toBe(0);
  });

  it('SUBMIT_ANSWER sets status to answerFeedback', () => {
    const pack = buildPack();
    const started = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    const next = gameReducer(started, { type: 'SUBMIT_ANSWER', answerIndex: 1 });
    expect(next.status).toBe('answerFeedback');
  });

  it('ADVANCE_TURN after 18 questions → status results', () => {
    const pack = buildPack();
    let state = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    for (let i = 0; i < 18; i += 1) {
      state = gameReducer(state, { type: 'ADVANCE_TURN' });
    }
    expect(state.status).toBe('results');
  });

  it('ADVANCE_TURN alternates currentTurn between 1 and 2', () => {
    const pack = buildPack();
    const started = gameReducer(initialGameState, { type: 'START_GAME', gamePack: pack });
    const next = gameReducer(started, { type: 'ADVANCE_TURN' });
    expect(next.currentTurn).toBe(2);
  });

  it('USE_AID decrements aidRemaining count', () => {
    const next = gameReducer(initialGameState, { type: 'USE_AID', team: 1, aidType: 'skip' });
    expect(next.team1.aidsRemaining.skip).toBe(0);
  });

  it('USE_AID refuses if count already 0', () => {
    const used = gameReducer(initialGameState, { type: 'USE_AID', team: 1, aidType: 'skip' });
    const next = gameReducer(used, { type: 'USE_AID', team: 1, aidType: 'skip' });
    expect(next.team1.aidsRemaining.skip).toBe(0);
  });

  it('RESET_GAME returns to initial state', () => {
    const next = gameReducer(initialGameState, { type: 'RESET_GAME' });
    expect(next).toEqual(initialGameState);
  });
});
