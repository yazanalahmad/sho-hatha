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
  'league-of-legends',
  'League of Legends',
  'ليغ أوف ليجندز',
  '⚔️',
  'Champions, roles, items, esports, and Runeterra lore',
  'الأبطال والأدوار والعناصر والرياضات الإلكترونية وقصة رونتيرا',
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
