ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS answer_en TEXT,
  ADD COLUMN IF NOT EXISTS answer_ar TEXT;

UPDATE questions
SET
  answer_en = COALESCE(answer_en, options_en ->> correct_answer_index),
  answer_ar = COALESCE(answer_ar, options_ar ->> correct_answer_index)
WHERE correct_answer_index IS NOT NULL;

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'questions'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%correct_answer_index%'
  LOOP
    EXECUTE format('ALTER TABLE questions DROP CONSTRAINT IF EXISTS %I', constraint_name);
  END LOOP;
END $$;

ALTER TABLE questions
  DROP CONSTRAINT IF EXISTS questions_options_en_length,
  DROP CONSTRAINT IF EXISTS questions_options_ar_length,
  ALTER COLUMN options_en DROP NOT NULL,
  ALTER COLUMN correct_answer_index DROP NOT NULL;
