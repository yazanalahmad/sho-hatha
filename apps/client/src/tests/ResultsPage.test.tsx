import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ResultsPage } from '../pages/ResultsPage';
import { buildPack } from './test-data';

const navigateMock = vi.fn();
const dispatchMock = vi.fn();
let mockedState: any;

vi.mock('../hooks/useGameContext', () => ({
  useGameContext: () => ({ state: mockedState, dispatch: dispatchMock }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, unknown>) => {
      if (key === 'results.winner') return `${values?.team as string} Wins!`;
      if (key === 'results.tie') return "It's a Tie!";
      if (key === 'results.playAgain') return 'Play Again';
      return key;
    },
  }),
}));

describe('ResultsPage', () => {
  beforeEach(() => {
    mockedState = {
      gamePack: buildPack(),
      team1: { name: 'A', score: 120 },
      team2: { name: 'B', score: 90 },
    };
    navigateMock.mockReset();
    dispatchMock.mockReset();
  });

  it('redirects to / if no gamePack in state', async () => {
    mockedState.gamePack = null;
    render(<ResultsPage />);
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/', { replace: true }));
  });

  it('displays winner when scores differ', () => {
    render(<ResultsPage />);
    expect(screen.getByText('A Wins!')).toBeInTheDocument();
  });

  it('displays tie message when scores equal', () => {
    mockedState.team2.score = 120;
    render(<ResultsPage />);
    expect(screen.getByText("It's a Tie!")).toBeInTheDocument();
  });

  it('Play Again dispatches RESET_GAME and navigates to /', () => {
    render(<ResultsPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'RESET_GAME' });
    expect(navigateMock).toHaveBeenCalledWith('/');
  });
});
