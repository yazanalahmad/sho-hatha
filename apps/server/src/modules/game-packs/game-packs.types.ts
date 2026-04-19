export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameQuestion {
  id: string;
  categoryId: string;
  difficulty: Difficulty;
  points: 10 | 20 | 30;
  question_en: string;
  question_ar: string | null;
  image_url: string | null;
  options_en: [string, string, string, string];
  options_ar: [string, string, string, string] | null;
  correct_answer_index: 0 | 1 | 2 | 3;
  explanation_en: string | null;
  explanation_ar: string | null;
}

export interface TurnOrderItem {
  turn: number;
  team: 1 | 2;
  questionId: string;
}

export interface TeamDifficultyDistribution {
  easy: number;
  medium: number;
  hard: number;
}

export interface GenerateGamePackResponse {
  packId: string;
  generatedAt: string;
  pack: {
    team1Questions: GameQuestion[];
    team2Questions: GameQuestion[];
    turnOrder: TurnOrderItem[];
    metadata: {
      difficultyDistribution: {
        team1: TeamDifficultyDistribution;
        team2: TeamDifficultyDistribution;
      };
      targetDistribution: {
        easy: number;
        medium: number;
        hard: number;
      };
      fallbacksUsed: number;
    };
  };
}

export interface BoardCategory {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  icon: string | null;
}

export interface BoardQuestion {
  id: string;
  categoryId: string;
  difficulty: Difficulty;
  pointValue: 1 | 2 | 3;
  question_en: string;
  question_ar: string | null;
  image_url: string | null;
  options_en: [string, string, string, string];
  options_ar: [string, string, string, string] | null;
  correct_answer_index: 0 | 1 | 2 | 3;
  explanation_en: string | null;
  explanation_ar: string | null;
}

export interface GenerateBoardGamePackResponse {
  packId: string;
  generatedAt: string;
  pack: {
    team1Categories: BoardCategory[];
    team2Categories: BoardCategory[];
    questions: BoardQuestion[];
    metadata: {
      fallbacksUsed: number;
    };
  };
}
