import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AidsPanel } from '../components/game/AidsPanel';
import { AnswerGrid } from '../components/game/AnswerGrid';
import { FeedbackOverlay } from '../components/game/FeedbackOverlay';
import { QuestionCard } from '../components/game/QuestionCard';
import { Scoreboard } from '../components/game/Scoreboard';
import { Timer } from '../components/game/Timer';
import { TurnBanner } from '../components/game/TurnBanner';
import { PageFrame } from '../components/shared/PageFrame';
import { PageTransition } from '../components/shared/PageTransition';
import { useGameContext } from '../hooks/useGameContext';
import { useTimer } from '../hooks/useTimer';
import { getQuestionForTurn } from '../state/game-reducer';
import type { BoardQuestionData, GamePack } from '../state/types';

function pick50(correctIndex: number): number[] {
  const wrong = [0, 1, 2, 3].filter((i) => i !== correctIndex);
  for (let i = wrong.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
  }
  return wrong.slice(0, 2);
}

function difficultyFromPoint(point: 1 | 2 | 3): 'easy' | 'medium' | 'hard' {
  if (point === 1) return 'easy';
  if (point === 2) return 'medium';
  return 'hard';
}

function isBoardPack(pack: GamePack | null): pack is GamePack & {
  pack: {
    team1Categories: NonNullable<GamePack['pack']['team1Categories']>;
    team2Categories: NonNullable<GamePack['pack']['team2Categories']>;
    questions: NonNullable<GamePack['pack']['questions']>;
  };
} {
  return Boolean(pack?.pack.team1Categories && pack.pack.team2Categories && pack.pack.questions);
}

export function GamePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch, timerState, timerDispatch } = useGameContext();
  const [showBanner, setShowBanner] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [activeQuestion, setActiveQuestion] = useState<BoardQuestionData | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [timerStartedAt, setTimerStartedAt] = useState<number>(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [timeoutSwitched, setTimeoutSwitched] = useState(false);

  useTimer(timerDispatch);

  const boardMode = isBoardPack(state.gamePack);

  useEffect(() => {
    if (!state.gamePack) {
      navigate('/', { replace: true });
    }
  }, [state.gamePack, navigate]);

  useEffect(() => {
    if (state.status === 'results') {
      navigate('/results');
    }
  }, [state.status, navigate]);

  useEffect(() => {
    if (!boardMode || !activeQuestion || revealed) {
      return;
    }

    const id = window.setInterval(() => {
      const nextElapsedMs = Date.now() - timerStartedAt;
      setElapsedMs(nextElapsedMs);
      if (nextElapsedMs >= state.timerDuration * 1000 && !timeoutSwitched) {
        dispatch({ type: 'SWITCH_TURN' });
        setTimeoutSwitched(true);
      }
    }, 100);

    return () => window.clearInterval(id);
  }, [activeQuestion, boardMode, dispatch, revealed, state.timerDuration, timeoutSwitched, timerStartedAt]);

  useEffect(() => {
    if (boardMode) return;
    if (!state.gamePack || state.status === 'results') {
      return;
    }

    setShowBanner(true);
    const bannerTimeout = window.setTimeout(() => {
      setShowBanner(false);
      timerDispatch({ type: 'START', durationSeconds: state.timerDuration });
    }, 1500);

    return () => window.clearTimeout(bannerTimeout);
  }, [boardMode, state.currentQuestionIndex, state.gamePack, state.status, state.timerDuration, timerDispatch]);

  useEffect(() => {
    if (boardMode) return;
    if (timerState.status === 'expired' && state.status === 'playing') {
      dispatch({ type: 'SUBMIT_ANSWER', answerIndex: null });
    }
  }, [boardMode, timerState.status, state.status, dispatch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (boardMode) {
        if (activeQuestion && event.key.toLowerCase() === 'f') {
          setRevealed(true);
        }
        if (event.key === 'Escape') {
          if (activeQuestion) {
            setActiveQuestion(null);
            setRevealed(false);
            setElapsedMs(0);
            return;
          }
          navigate('/');
        }
        return;
      }

      if (state.status === 'playing') {
        const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
        const answerIndex = keyMap[event.key];
        if (answerIndex !== undefined) {
          setSelectedAnswer(answerIndex);
          dispatch({ type: 'SUBMIT_ANSWER', answerIndex });
          return;
        }
      }

      if (state.status === 'answerFeedback' && event.code === 'Space') {
        event.preventDefault();
        setSelectedAnswer(null);
        timerDispatch({ type: 'RESET' });
        dispatch({ type: 'ADVANCE_TURN' });
      }

      if (event.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeQuestion, boardMode, dispatch, navigate, state.status, timerDispatch]);

  if (!state.gamePack) {
    return null;
  }

  if (boardMode) {
    const boardPack = state.gamePack.pack as {
      team1Categories: NonNullable<GamePack['pack']['team1Categories']>;
      team2Categories: NonNullable<GamePack['pack']['team2Categories']>;
      questions: NonNullable<GamePack['pack']['questions']>;
    };
    const currentTeam = state.currentTurn === 1 ? state.team1 : state.team2;
    const teamColor = state.currentTurn === 1 ? 'var(--team1)' : 'var(--team2)';
    const isArabic = i18n.language === 'ar';

    const questionLookup = new Map<string, BoardQuestionData>();
    boardPack.questions.forEach((question) => {
      questionLookup.set(`${question.categoryId}:${question.difficulty}`, question);
    });

    const allQuestionsCount = boardPack.questions.length;

    const openQuestion = (categoryId: string, pointValue: 1 | 2 | 3) => {
      const difficulty = difficultyFromPoint(pointValue);
      const question = questionLookup.get(`${categoryId}:${difficulty}`);
      if (!question || usedQuestionIds.has(question.id)) {
        return;
      }
      setActiveQuestion(question);
      setRevealed(false);
      setElapsedMs(0);
      setTimeoutSwitched(false);
      setTimerStartedAt(Date.now());
    };

    const finalizeQuestion = (awardedTeam: 1 | 2 | null) => {
      if (!activeQuestion) return;

      if (awardedTeam) {
        dispatch({ type: 'AWARD_POINTS', team: awardedTeam, points: activeQuestion.pointValue });
      }

      const nextUsed = new Set(usedQuestionIds);
      nextUsed.add(activeQuestion.id);
      setUsedQuestionIds(nextUsed);

      if (nextUsed.size >= allQuestionsCount) {
        dispatch({ type: 'END_GAME' });
      } else if (!timeoutSwitched) {
        dispatch({ type: 'SWITCH_TURN' });
      }

      setActiveQuestion(null);
      setRevealed(false);
      setElapsedMs(0);
      setTimeoutSwitched(false);
    };

    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const timerRatio = Math.min(1, elapsedSeconds / state.timerDuration);
    const timerColor = timerRatio < 0.5 ? '#2dd887' : timerRatio < 0.85 ? '#eab308' : '#ff4757';

    return (
      <PageFrame>
        <PageTransition transitionKey={`board-${state.currentTurn}-${usedQuestionIds.size}`}>
          <Scoreboard
            team1Name={state.team1.name}
            team2Name={state.team2.name}
            team1Score={state.team1.score}
            team2Score={state.team2.score}
            current={t('game.turn', { team: currentTeam.name })}
            currentTeam={state.currentTurn}
          />

          <div className="text-center">
            <motion.h2
              className="text-6xl md:text-7xl"
              style={{ color: teamColor }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {t('game.turn', { team: currentTeam.name })}
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[{ team: 1 as const, categories: boardPack.team1Categories }, { team: 2 as const, categories: boardPack.team2Categories }].map(({ team, categories }) => (
              <motion.div
                key={team}
                className={`card relative space-y-4 p-4 md:p-5 ${team === 1 ? 'shadow-[0_0_30px_var(--team1-glow)]' : 'shadow-[0_0_30px_var(--team2-glow)]'}`}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                <span
                  className={`absolute inset-y-0 ${team === 1 ? 'left-0' : 'right-0'} w-1 rounded-full ${team === 1 ? 'bg-team1' : 'bg-team2'}`}
                  aria-hidden
                />
                <h3 className={`px-2 text-4xl tracking-[0.12em] ${team === 1 ? 'text-team1' : 'text-team2'}`}>
                  {team === 1 ? state.team1.name : state.team2.name}
                </h3>
                {categories.map((category) => {
                  const categoryName = isArabic ? category.name_ar : category.name_en;
                  return (
                    <motion.div
                      key={category.id}
                      className="rounded border border-gold-muted bg-[linear-gradient(160deg,rgba(242,190,53,0.12),rgba(26,18,8,0.08))] p-4"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div className="mb-3 h-16 overflow-hidden text-3xl font-display leading-tight text-gold">
                        <span className="inline-block align-top">
                          {category.icon ? `${category.icon} ` : ''}
                          {categoryName}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((point) => {
                          const question = questionLookup.get(`${category.id}:${difficultyFromPoint(point as 1 | 2 | 3)}`);
                          const used = question ? usedQuestionIds.has(question.id) : true;
                          return (
                            <button
                              key={`${category.id}-${point}`}
                              type="button"
                              className={[
                                'card h-20 w-full px-2 text-center text-4xl leading-none font-score',
                                'flex items-center justify-center disabled:opacity-35',
                                'transition-all duration-150 hover:-translate-y-0.5 hover:scale-[1.04]',
                                point === 1 ? 'bg-[rgba(45,216,135,0.12)] border-[rgba(45,216,135,0.5)]' : '',
                                point === 2 ? 'bg-[rgba(234,179,8,0.14)] border-[rgba(234,179,8,0.6)]' : '',
                                point === 3 ? 'bg-[rgba(255,71,87,0.12)] border-[rgba(255,71,87,0.55)]' : '',
                                used ? 'cursor-not-allowed grayscale-[0.15]' : '',
                              ].join(' ')}
                              onClick={() => openQuestion(category.id, point as 1 | 2 | 3)}
                              disabled={used}
                            >
                              {used ? '—' : point}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>

          {activeQuestion ? (
            <div className="fixed inset-0 z-50 overflow-auto bg-[color-mix(in_srgb,var(--bg-base)_86%,black_14%)] p-4 backdrop-blur-[2px]">
              <div className="mx-auto max-w-3xl space-y-4">
                <div className="card p-4 flex items-center justify-between">
                  <div className="text-lg text-gold">{t('game.turn', { team: currentTeam.name })}</div>
                  <div className="font-score text-4xl" style={{ color: timerColor }}>{elapsedSeconds}s / {state.timerDuration}s</div>
                </div>

                <div className="card p-6 space-y-4 border-gold">
                  <div className="text-gold text-xl">{activeQuestion.pointValue} pts</div>
                  <QuestionCard text={isArabic ? (activeQuestion.question_ar ?? activeQuestion.question_en) : activeQuestion.question_en} />

                  {!revealed ? (
                    <button
                      type="button"
                      className="w-full bg-gold text-bg-base font-display text-3xl py-3"
                      onClick={() => setRevealed(true)}
                    >
                      {t('game.finish')}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-2xl text-correct">
                        {t('game.feedback.correctAnswer', {
                          answer: (isArabic ? (activeQuestion.options_ar ?? activeQuestion.options_en) : activeQuestion.options_en)[activeQuestion.correct_answer_index] ?? '',
                        })}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button type="button" className="card py-3 text-team1 font-display text-2xl" onClick={() => finalizeQuestion(1)}>
                          {state.team1.name}
                        </button>
                        <button type="button" className="card py-3 text-team2 font-display text-2xl" onClick={() => finalizeQuestion(2)}>
                          {state.team2.name}
                        </button>
                        <button type="button" className="card py-3 text-ivory font-display text-2xl" onClick={() => finalizeQuestion(null)}>
                          {t('game.noOne')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </PageTransition>
      </PageFrame>
    );
  }

  const question = getQuestionForTurn(state.gamePack, state.currentTurn, state.currentQuestionIndex);
  if (!question) {
    return null;
  }

  const isArabic = i18n.language === 'ar';
  const questionText = isArabic ? (question.question_ar ?? question.question_en) : question.question_en;
  const rawOptions = isArabic ? (question.options_ar ?? question.options_en) : question.options_en;
  const options = Array.isArray(rawOptions) ? rawOptions : [];
  const explanation = isArabic ? (question.explanation_ar ?? question.explanation_en) : question.explanation_en;

  const currentTeam = state.currentTurn === 1 ? state.team1 : state.team2;
  const teamColor = state.currentTurn === 1 ? 'var(--team1)' : 'var(--team2)';

  const onAnswer = (index: number) => {
    if (state.status !== 'playing') {
      return;
    }
    setSelectedAnswer(index);
    dispatch({ type: 'SUBMIT_ANSWER', answerIndex: index });
  };

  const onNext = () => {
    setSelectedAnswer(null);
    timerDispatch({ type: 'RESET' });
    dispatch({ type: 'ADVANCE_TURN' });
  };

  const onFifty = () => {
    if (state.status !== 'playing') {
      return;
    }
    dispatch({ type: 'USE_AID', team: state.currentTurn, aidType: 'fiftyFifty' });
    dispatch({ type: 'SET_REMOVED_OPTIONS', indices: pick50(question.correct_answer_index) });
  };

  const onSkip = () => {
    if (state.status !== 'playing') {
      return;
    }
    dispatch({ type: 'USE_AID', team: state.currentTurn, aidType: 'skip' });
    dispatch({ type: 'SUBMIT_ANSWER', answerIndex: null });
  };

  const onFreeze = () => {
    if (state.status !== 'playing') {
      return;
    }
    dispatch({ type: 'USE_AID', team: state.currentTurn, aidType: 'freezeTimer' });
    timerDispatch({ type: 'FREEZE', durationSeconds: 10, nowMs: Date.now() });
  };

  return (
    <PageFrame>
      <PageTransition transitionKey={`game-${state.currentQuestionIndex}`}>
        <TurnBanner open={showBanner} teamName={currentTeam.name} teamColor={teamColor} />
        <Scoreboard
          team1Name={state.team1.name}
          team2Name={state.team2.name}
          team1Score={state.team1.score}
          team2Score={state.team2.score}
          current={t('game.question', { current: state.currentQuestionIndex + 1, total: 18 })}
          currentTeam={state.currentTurn}
        />
        <div className="text-center">
          <motion.h2
            className="text-6xl md:text-7xl"
            style={{ color: teamColor }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {t('game.turn', { team: currentTeam.name })}
          </motion.h2>
        </div>
        <Timer remainingMs={timerState.remainingMs} durationSeconds={state.timerDuration} isFrozen={timerState.status === 'frozen'} />
        <QuestionCard text={questionText} />
        <AnswerGrid
          options={options}
          removedOptionIndices={state.removedOptionIndices}
          disabled={state.status !== 'playing'}
          revealCorrectIndex={state.status === 'answerFeedback' ? state.lastCorrectAnswerIndex : null}
          selectedIndex={selectedAnswer}
          onSelect={onAnswer}
        />
        <AidsPanel
          fifty={currentTeam.aidsRemaining.fiftyFifty}
          skip={currentTeam.aidsRemaining.skip}
          freeze={currentTeam.aidsRemaining.freezeTimer}
          onFifty={onFifty}
          onSkip={onSkip}
          onFreeze={onFreeze}
          disabled={state.status !== 'playing'}
        />
        <FeedbackOverlay
          open={state.status === 'answerFeedback'}
          correct={Boolean(state.lastAnswerCorrect)}
          timedOut={selectedAnswer === null && !state.lastAnswerCorrect}
          points={state.pointsAwarded ?? 0}
          correctAnswerText={options[state.lastCorrectAnswerIndex ?? 0] ?? ''}
          explanation={explanation}
          onNext={onNext}
        />
      </PageTransition>
    </PageFrame>
  );
}
