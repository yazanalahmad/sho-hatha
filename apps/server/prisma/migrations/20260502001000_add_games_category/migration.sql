INSERT INTO public.categories (
  slug,
  name_en,
  name_ar,
  icon,
  description_en,
  description_ar,
  is_active,
  updated_at
)
VALUES (
  'games',
  'Games',
  'ألعاب',
  '🎮',
  'Video games, genres, consoles, studios, and gaming culture',
  'ألعاب الفيديو والأنواع والأجهزة والاستوديوهات وثقافة اللعب',
  true,
  now()
)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_ar = EXCLUDED.name_ar,
  icon = EXCLUDED.icon,
  description_en = EXCLUDED.description_en,
  description_ar = EXCLUDED.description_ar,
  is_active = EXCLUDED.is_active,
  updated_at = now();
