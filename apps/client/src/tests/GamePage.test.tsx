import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GamePage } from '../pages/GamePage';
import { buildPack } from './test-data';

const navigateMock = vi.fn();
const dispatchMock = vi.fn();
const timerDispatchMock = vi.fn();

let mockedState: any;
let mockedTimerState: any;

vi.mock('../hooks/useGameContext', () => ({
  useGameContext: () => ({
    state: mockedState,
    dispatch: dispatchMock,
    timerState: mockedTimerState,
    timerDispatch: timerDispatchMock,
  }),
}));

vi.mock('../hooks/useTimer', () => ({
  useTimer: () => undefined,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (key === 'game.question') return `Question ${(values?.current as number) ?? 1} of ${(values?.total as number) ?? 18}`;
      if (key === 'game.turn') return `${values?.team as string}'s Turn`;
      if (key === 'game.feedback.correct') return `Correct! +${values?.points as number} pts`;
      if (key === 'game.feedback.wrong') return 'Wrong!';
      if (key === 'game.feedback.timeUp') return "Time's Up!";
      if (key === 'game.feedback.correctAnswer') return `Correct answer: ${values?.answer as string}`;
      if (key === 'game.next') return 'Next Question';
      if (key === 'game.aids.fiftyFifty') return '50/50';
      if (key === 'game.aids.skip') return 'Skip';
      if (key === 'game.aids.freeze') return 'Freeze';
      return key;
    },
    i18n: { language: 'en' },
  }),
}));

describe('GamePage', () => {
  beforeEach(() => {
    mockedState = {
      status: 'playing',
      team1: { name: 'A', score: 0, selectedCategoryIds: [], aidsRemaining: { fiftyFifty: 1, skip: 1, freezeTimer: 1 } },
      team2: { name: 'B', score: 0, selectedCategoryIds: [], aidsRemaining: { fiftyFifty: 1, skip: 1, freezeTimer: 1 } },
      timerDuration: 30,
      currentTurn: 1,
      currentQuestionIndex: 0,
      gamePack: buildPack(),
      removedOptionIndices: [],
      lastAnswerCorrect: null,
      lastCorrectAnswerIndex: null,
      pointsAwarded: null,
    };
    mockedTimerState = { status: 'running', remainingMs: 28000, durationSeconds: 30 };
    navigateMock.mockReset();
    dispatchMock.mockReset();
    timerDispatchMock.mockReset();
  });

  it('redirects to / if no gamePack in state', async () => {
    mockedState.gamePack = null;
    render(<GamePage />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/', { replace: true }));
  });

  it('renders question text from current turn', () => {
    render(<GamePage />);
    expect(screen.getByText(/Question t1-0/)).toBeInTheDocument();
  });

  it('clicking correct answer dispatches SUBMIT_ANSWER with correct index', () => {
    render(<GamePage />);
    fireEvent.click(screen.getByText('B1'));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'SUBMIT_ANSWER', answerIndex: 1 });
  });

  it('timer expiry dispatches SUBMIT_ANSWER(null)', () => {
    mockedTimerState.status = 'expired';
    render(<GamePage />);
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'SUBMIT_ANSWER', answerIndex: null });
  });

  it('FeedbackOverlay shows after answer', () => {
    mockedState.status = 'answerFeedback';
    mockedState.lastAnswerCorrect = false;
    mockedState.lastCorrectAnswerIndex = 1;
    render(<GamePage />);
    expect(screen.getByText(/Time's Up!/)).toBeInTheDocument();
  });

  it('50/50 removes exactly 2 wrong options, never correct', () => {
    render(<GamePage />);
    fireEvent.click(screen.getByRole('button', { name: /50\/50: 1/i }));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'USE_AID', team: 1, aidType: 'fiftyFifty' });
  });

  it('Freeze dispatches FREEZE to timer', () => {
    render(<GamePage />);
    fireEvent.click(screen.getByRole('button', { name: /Freeze: 1/i }));
    expect(timerDispatchMock).toHaveBeenCalledWith(expect.objectContaining({ type: 'FREEZE' }));
  });

  it('ADVANCE_TURN increments question index', () => {
    mockedState.status = 'answerFeedback';
    mockedState.lastAnswerCorrect = true;
    mockedState.lastCorrectAnswerIndex = 1;
    render(<GamePage />);
    fireEvent.click(screen.getByRole('button', { name: 'Next Question' }));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'ADVANCE_TURN' });
  });
});
