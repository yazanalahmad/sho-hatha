import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface TimerProps {
  remainingMs: number;
  durationSeconds: number;
  isFrozen: boolean;
}

export function Timer({ remainingMs, durationSeconds, isFrozen }: TimerProps) {
  const { t } = useTranslation();
  const seconds = Math.ceil(remainingMs / 1000);
  const total = durationSeconds * 1000 || 1;
  const progress = Math.max(0, Math.min(1, remainingMs / total));

  let timerColor = '#2dd887';
  let pulseClass = '';

  if (isFrozen) {
    timerColor = '#7dd3fc';
    pulseClass = 'animate-pulse-slow';
  } else if (seconds <= 0) {
    timerColor = '#b91c1c';
    pulseClass = 'animate-pulse-fast';
  } else if (seconds <= 5) {
    timerColor = '#ff4757';
    pulseClass = 'animate-pulse-fast';
  } else if (seconds <= 10) {
    timerColor = '#eab308';
    pulseClass = 'animate-pulse-slow';
  }

  return (
    <div className={`mx-auto w-fit ${pulseClass}`} aria-label="timer">
      <svg viewBox="0 0 100 100" className="w-32 h-32">
        <circle cx="50" cy="50" r="44" fill="none" stroke="#221a0f" strokeWidth="6" />
        <motion.circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          stroke={timerColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={276.5}
          strokeDashoffset={276.5 * (1 - progress)}
          style={{ rotate: -90, transformOrigin: 'center' }}
          transition={{ duration: 0.1 }}
        />
        <text
          x="50"
          y="50"
          textAnchor="middle"
          dominantBaseline="central"
          fill={timerColor}
          style={{ fontFamily: 'Oswald', fontSize: '28px', fontWeight: 700 }}
        >
          {isFrozen ? '❄' : seconds}
        </text>
      </svg>
      {isFrozen ? (
        <div className="text-center text-xs font-display tracking-[0.25em] text-[#7dd3fc]">
          {t('game.frozen')}
        </div>
      ) : null}
    </div>
  );
}
