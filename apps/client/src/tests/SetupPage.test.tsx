import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { SetupPage } from '../pages/SetupPage';

const navigateMock = vi.fn();
const dispatchMock = vi.fn();
const changeLanguageMock = vi.fn();

vi.mock('../hooks/useGameContext', () => ({
  useGameContext: () => ({
    dispatch: dispatchMock,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        'setup.team1Label': 'Team 1 Name',
        'setup.team2Label': 'Team 2 Name',
        'setup.timerLabel': 'Timer Duration',
        'setup.categoriesPerTeamLabel': 'Categories Per Team',
        'setup.startButton': 'Start Game',
        'setup.validation.teamNameRequired': 'Please enter a name for both teams',
        'setup.validation.timerRequired': 'Please select a timer duration',
        'setup.title': 'Sho Hatha?',
        'setup.subtitle': 'Who knows more?',
      };
      return map[key] ?? key;
    },
    i18n: {
      language: 'en',
      changeLanguage: changeLanguageMock,
    },
  }),
}));

describe('SetupPage', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    dispatchMock.mockReset();
    changeLanguageMock.mockReset();
  });

  it('renders team name inputs and timer buttons', () => {
    render(<SetupPage />);

    expect(screen.getByText('Team 1 Name')).toBeInTheDocument();
    expect(screen.getByText('Team 2 Name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '15s' })).toBeInTheDocument();
  });

  it('shows validation error if team names empty on submit', () => {
    render(<SetupPage />);
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    expect(screen.getAllByText('Please enter a name for both teams').length).toBeGreaterThan(0);
  });

  it('shows validation error if no timer selected', () => {
    render(<SetupPage />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'A' } });
    fireEvent.change(inputs[1], { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));
    expect(screen.getByText('Please select a timer duration')).toBeInTheDocument();
  });

  it('dispatches START_SETUP with correct data on valid submit', () => {
    render(<SetupPage />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'A' } });
    fireEvent.change(inputs[1], { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'START_SETUP',
      team1Name: 'A',
      team2Name: 'B',
      timerDuration: 30,
      categoriesPerTeam: 3,
    });
  });

  it('navigates to /categories on valid submit', () => {
    render(<SetupPage />);
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: 'A' } });
    fireEvent.change(inputs[1], { target: { value: 'B' } });
    fireEvent.click(screen.getByRole('button', { name: '30s' }));
    fireEvent.click(screen.getByRole('button', { name: /Start Game/i }));

    expect(navigateMock).toHaveBeenCalledWith('/categories');
  });

  it('LanguageToggle switches language', () => {
    render(<SetupPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Arabic' }));
    expect(changeLanguageMock).toHaveBeenCalledWith('ar');
  });
});
