import { useTranslation } from 'react-i18next';

interface AidsPanelProps {
  fifty: number;
  skip: number;
  freeze: number;
  onFifty: () => void;
  onSkip: () => void;
  onFreeze: () => void;
  disabled: boolean;
}

export function AidsPanel({ fifty, skip, freeze, onFifty, onSkip, onFreeze, disabled }: AidsPanelProps) {
  const { t } = useTranslation();

  const btn = 'card px-4 py-3 text-sm font-display tracking-wide disabled:opacity-40';
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button
        type="button"
        className={btn}
        onClick={onFifty}
        disabled={disabled || fifty <= 0}
      >
        {t('game.aids.fiftyFifty')}: {fifty}
      </button>
      <button
        type="button"
        className={btn}
        onClick={onSkip}
        disabled={disabled || skip <= 0}
      >
        {t('game.aids.skip')}: {skip}
      </button>
      <button
        type="button"
        className={btn}
        onClick={onFreeze}
        disabled={disabled || freeze <= 0}
      >
        ❄ {t('game.aids.freeze')}: {freeze}
      </button>
    </div>
  );
}
