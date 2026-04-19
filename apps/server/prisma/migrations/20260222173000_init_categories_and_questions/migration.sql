CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT,
  description_en TEXT,
  description_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  points INTEGER NOT NULL CHECK (points IN (10, 20, 30)),
  question_en TEXT UNIQUE NOT NULL,
  question_ar TEXT,
  options_en JSONB NOT NULL,
  options_ar JSONB,
  correct_answer_index SMALLINT NOT NULL CHECK (correct_answer_index >= 0 AND correct_answer_index <= 3),
  explanation_en TEXT,
  explanation_ar TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT questions_options_en_length CHECK (jsonb_typeof(options_en) = 'array' AND jsonb_array_length(options_en) = 4),
  CONSTRAINT questions_options_ar_length CHECK (
    options_ar IS NULL OR (jsonb_typeof(options_ar) = 'array' AND jsonb_array_length(options_ar) = 4)
  ),
  CONSTRAINT questions_points_match_difficulty CHECK (
    (difficulty = 'easy' AND points = 10) OR
    (difficulty = 'medium' AND points = 20) OR
    (difficulty = 'hard' AND points = 30)
  )
);

CREATE INDEX IF NOT EXISTS idx_questions_category_id ON questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_composite ON questions(category_id, difficulty, is_active);
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON questions(is_active);
