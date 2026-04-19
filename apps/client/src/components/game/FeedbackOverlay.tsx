import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface FeedbackOverlayProps {
  open: boolean;
  correct: boolean;
  timedOut: boolean;
  points: number;
  correctAnswerText: string;
  explanation: string | null;
  onNext: () => void;
}

export function FeedbackOverlay({
  open,
  correct,
  timedOut,
  points,
  correctAnswerText,
  explanation,
  onNext,
}: FeedbackOverlayProps) {
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className={`fixed inset-0 z-40 flex items-center justify-center p-4 ${correct ? 'bg-[rgba(45,216,135,0.16)]' : 'bg-[rgba(255,71,87,0.16)]'}`}
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        >
          <div className="card max-w-2xl w-full p-8 text-center" role="status" aria-live="assertive">
            <div className={`text-7xl ${correct ? 'text-correct' : 'text-wrong'}`}>{correct ? '✓' : '✗'}</div>
            <h2 className="text-5xl mt-2">{correct ? t('game.feedback.correct', { points }) : timedOut ? t('game.feedback.timeUp') : t('game.feedback.wrong')}</h2>
            {!correct ? <p className="text-xl mt-4 text-correct">{t('game.feedback.correctAnswer', { answer: correctAnswerText })}</p> : null}
            {explanation ? <p className="text-lg mt-4 text-gold-muted">{explanation}</p> : null}
            <button type="button" className="mt-6 px-8 py-3 bg-gold text-bg-base font-display text-2xl" onClick={onNext}>
              {t('game.next')}
            </button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
