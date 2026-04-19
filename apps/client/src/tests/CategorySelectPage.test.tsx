import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategorySelectPage } from '../pages/CategorySelectPage';

const navigateMock = vi.fn();
const dispatchMock = vi.fn();
const getAllCategoriesMock = vi.fn();
const generateBoardGamePackMock = vi.fn();

const tMock = (key: string) => {
  const map: Record<string, string> = {
    'categories.title': 'Choose Categories',
    'categories.loading': 'Loading categories...',
    'categories.error': 'Could not load categories. Please try again.',
    'categories.retry': 'Retry',
    'categories.startButton': "Let's Play!",
  };
  return map[key] ?? key;
};

let mockedState: any;

vi.mock('../services/categories-api', () => ({
  getAllCategories: (...args: any[]) => getAllCategoriesMock(...args),
}));

vi.mock('../services/game-pack-api', () => ({
  generateBoardGamePack: (...args: any[]) => generateBoardGamePackMock(...args),
}));

vi.mock('../hooks/useGameContext', () => ({
  useGameContext: () => ({
    state: mockedState,
    dispatch: dispatchMock,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: tMock }),
}));

const categories = Array.from({ length: 6 }, (_, i) => ({
  id: `c${i + 1}`,
  slug: `s${i + 1}`,
  name_en: `Cat ${i + 1}`,
  name_ar: `تصنيف ${i + 1}`,
  icon: '📦',
}));

describe('CategorySelectPage', () => {
  beforeEach(() => {
    mockedState = {
      categoriesPerTeam: 3,
      team1: { name: 'Team A', selectedCategoryIds: [], aidsRemaining: {}, score: 0, color: 'team1' },
      team2: { name: 'Team B', selectedCategoryIds: [], aidsRemaining: {}, score: 0, color: 'team2' },
    };
    navigateMock.mockReset();
    dispatchMock.mockReset();
    getAllCategoriesMock.mockReset();
    generateBoardGamePackMock.mockReset();
  });

  it('shows loading spinner while fetching categories', () => {
    getAllCategoriesMock.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(categories), 200)),
    );
    render(<CategorySelectPage />);
    expect(screen.getByText('Loading categories...')).toBeInTheDocument();
  });

  it('renders 6 category cards after load', async () => {
    getAllCategoriesMock.mockResolvedValue(categories);
    render(<CategorySelectPage />);
    await screen.findByText('Cat 1');
    expect(screen.getByText('Cat 6')).toBeInTheDocument();
  });

  it('shows error + retry button on fetch failure', async () => {
    getAllCategoriesMock.mockRejectedValue(new Error('x'));
    render(<CategorySelectPage />);
    await waitFor(() => expect(screen.getByText('Could not load categories. Please try again.')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('assigns category to Team 1 on first click', async () => {
    getAllCategoriesMock.mockResolvedValue(categories);
    render(<CategorySelectPage />);
    await screen.findByText('Cat 1');
    fireEvent.click(screen.getByText('Cat 1'));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'SET_TEAM_CATEGORIES', team: 1, categoryIds: ['c1'] });
  });

  it('assigns category to Team 2 on second click (if Team 1 full)', async () => {
    mockedState.team1.selectedCategoryIds = ['c1', 'c2', 'c3'];
    getAllCategoriesMock.mockResolvedValue(categories);
    render(<CategorySelectPage />);
    await screen.findByText('Cat 4');
    fireEvent.click(screen.getByText('Cat 4'));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'SET_TEAM_CATEGORIES', team: 2, categoryIds: ['c4'] });
  });

  it('deselects category on click if already selected by that team', async () => {
    mockedState.team1.selectedCategoryIds = ['c1'];
    getAllCategoriesMock.mockResolvedValue(categories);
    render(<CategorySelectPage />);
    await screen.findByText('Cat 1');
    fireEvent.click(screen.getByText('Cat 1'));
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'SET_TEAM_CATEGORIES', team: 1, categoryIds: [] });
  });

  it("disables 'Let's Play!' until both teams have 3", async () => {
    getAllCategoriesMock.mockResolvedValue(categories);
    render(<CategorySelectPage />);
    await screen.findByText('Cat 1');
    expect(screen.getByRole('button', { name: "Let's Play!" })).toBeDisabled();
  });

  it('calls generateBoardGamePack with correct IDs on submit', async () => {
    mockedState.team1.selectedCategoryIds = ['c1', 'c2', 'c3'];
    mockedState.team2.selectedCategoryIds = ['c4', 'c5', 'c6'];
    getAllCategoriesMock.mockResolvedValue(categories);
    generateBoardGamePackMock.mockResolvedValue({ packId: 'p1' });

    render(<CategorySelectPage />);
    await screen.findByText('Cat 1');
    fireEvent.click(screen.getByRole('button', { name: "Let's Play!" }));

    await waitFor(() => expect(generateBoardGamePackMock).toHaveBeenCalledWith(['c1', 'c2', 'c3'], ['c4', 'c5', 'c6']));
  });

  it('navigates to /game after successful pack generation', async () => {
    mockedState.team1.selectedCategoryIds = ['c1', 'c2', 'c3'];
    mockedState.team2.selectedCategoryIds = ['c4', 'c5', 'c6'];
    getAllCategoriesMock.mockResolvedValue(categories);
    generateBoardGamePackMock.mockResolvedValue({ packId: 'p1' });

    render(<CategorySelectPage />);
    await screen.findByText('Cat 1');
    fireEvent.click(screen.getByRole('button', { name: "Let's Play!" }));

    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith('/game'));
  });
});
