import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageFrame } from '../components/shared/PageFrame';
import { PageTransition } from '../components/shared/PageTransition';
import { useGameContext } from '../hooks/useGameContext';

export function ResultsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useGameContext();

  useEffect(() => {
    if (!state.gamePack) {
      navigate('/', { replace: true });
      return;
    }

    void confetti({
      particleCount: 120,
      spread: 90,
      colors: ['#f5c842', '#e8445a', '#3d9be9'],
    });
  }, [state.gamePack, navigate]);

  if (!state.gamePack) {
    return null;
  }

  const tie = state.team1.score === state.team2.score;
  const winner = state.team1.score > state.team2.score ? state.team1.name : state.team2.name;

  const playAgain = () => {
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
  };

  return (
    <PageFrame>
      <PageTransition transitionKey="results">
        <div className="card p-8 text-center space-y-6">
          <div className="text-7xl">🏆</div>
          <h1 className="text-6xl text-gold">{tie ? t('results.tie') : t('results.winner', { team: winner })}</h1>

          <div className="grid grid-cols-2 gap-4">
            <div className={`card p-5 ${!tie && winner !== state.team1.name ? 'opacity-60' : ''}`}>
              <p className="font-display text-2xl">{state.team1.name}</p>
              <p className="font-score text-6xl text-team1">{state.team1.score}</p>
            </div>
            <div className={`card p-5 ${!tie && winner !== state.team2.name ? 'opacity-60' : ''}`}>
              <p className="font-display text-2xl">{state.team2.name}</p>
              <p className="font-score text-6xl text-team2">{state.team2.score}</p>
            </div>
          </div>

          <button type="button" className="bg-gold text-bg-base font-display text-3xl px-8 py-3" onClick={playAgain}>
            {t('results.playAgain')}
          </button>
        </div>
      </PageTransition>
    </PageFrame>
  );
}
