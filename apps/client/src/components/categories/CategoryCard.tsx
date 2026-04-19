import type { CategoryData } from '../../state/types';
import { useTranslation } from 'react-i18next';

interface CategoryCardProps {
  category: CategoryData;
  selection: 0 | 1 | 2;
  onClick: () => void;
}

export function CategoryCard({ category, selection, onClick }: CategoryCardProps) {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language ?? 'en';
  const isArabic = currentLang.startsWith('ar');
  const primaryName = isArabic ? category.name_ar : category.name_en;
  const secondaryName = isArabic ? category.name_en : category.name_ar;

  const selectedClass =
    selection === 1
      ? 'border-team1 ring-2 ring-team1/70 shadow-[0_0_24px_var(--team1-glow)] bg-[rgba(232,68,90,0.20)]'
      : selection === 2
        ? 'border-team2 ring-2 ring-team2/70 shadow-[0_0_24px_var(--team2-glow)] bg-[rgba(61,155,233,0.20)]'
        : 'border-gold-muted';

  const sideMarker = selection === 1
    ? 'after:absolute after:left-0 after:top-0 after:h-full after:w-1.5 after:bg-team1'
    : selection === 2
      ? 'after:absolute after:right-0 after:top-0 after:h-full after:w-1.5 after:bg-team2'
      : '';

  return (
    <button
      type="button"
      className={`card relative h-[188px] w-full p-4 text-left transition-all duration-150 hover:-translate-y-1 hover:scale-[1.01] hover:border-gold hover:bg-[rgba(245,200,66,0.18)] hover:shadow-[0_0_24px_rgba(245,200,66,0.35)] ${selectedClass} ${sideMarker}`}
      onClick={onClick}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="mb-2 text-3xl">{category.icon ?? '❓'}</div>
        <div className="h-16 overflow-hidden font-display text-xl leading-tight">{primaryName}</div>
        <div className="mt-1 h-10 overflow-hidden text-sm leading-snug text-gold-muted">{secondaryName}</div>
      </div>
    </button>
  );
}
