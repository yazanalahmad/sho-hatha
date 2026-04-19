import type { Difficulty } from '../game-packs/game-packs.types';

export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface QuestionInput {
  category_id: string;
  difficulty: Difficulty;
  question_en: string;
  question_ar?: string;
  image_url?: string | null;
  options_en: [string, string, string, string];
  options_ar?: [string, string, string, string];
  correct_answer_index: 0 | 1 | 2 | 3;
  explanation_en?: string;
  explanation_ar?: string;
  is_active?: boolean;
}

export interface CategoryInput {
  slug: string;
  name_en: string;
  name_ar: string;
  icon?: string;
  description_en?: string;
  description_ar?: string;
  is_active?: boolean;
}
