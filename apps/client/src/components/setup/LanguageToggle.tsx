import { useTranslation } from 'react-i18next';

export function LanguageToggle() {
  const { i18n } = useTranslation();
  const currentLang = i18n?.language ?? 'en';
  const isArabic = currentLang.startsWith('ar');
  const nextLang = isArabic ? 'en' : 'ar';
  const label = isArabic ? 'English' : 'Arabic';

  return (
    <button
      className="min-w-[92px] border border-gold-muted px-3 py-2 text-sm font-score tracking-wide text-[color:var(--text-primary)] bg-[color:var(--bg-surface)] transition-colors hover:border-gold hover:bg-[color:var(--bg-card)]"
      onClick={() => void i18n?.changeLanguage?.(nextLang)}
      type="button"
    >
      {label}
    </button>
  );
}
