export interface Team {
  name: string;
  color: 'team1' | 'team2';
  score: number;
  selectedCategoryIds: string[];
  aidsRemaining: {
    fiftyFifty: number;
    skip: number;
    freezeTimer: number;
  };
}

export type GameStatus =
  | 'idle'
  | 'setup'
  | 'categorySelection'
  | 'playing'
  | 'answerFeedback'
  | 'results';

export interface CategoryData {
  id: string;
  slug: string;
  name_en: string;
  name_ar: string;
  icon: string | null;
}

export interface QuestionData {
  id: string;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: 10 | 20 | 30;
  question_en: string;
  question_ar: string | null;
  options_en: string[];
  options_ar: string[] | null;
  correct_answer_index: number;
  explanation_en: string | null;
  explanation_ar: string | null;
}

export interface BoardQuestionData {
  id: string;
  categoryId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pointValue: 1 | 2 | 3;
  question_en: string;
  question_ar: string | null;
  options_en: string[];
  options_ar: string[] | null;
  correct_answer_index: number;
  explanation_en: string | null;
  explanation_ar: string | null;
}

export interface TurnEntry {
  turn: number;
  team: 1 | 2;
  questionId: string;
}

export interface GamePack {
  packId: string;
  generatedAt: string;
  pack: {
    team1Questions?: QuestionData[];
    team2Questions?: QuestionData[];
    turnOrder?: TurnEntry[];
    team1Categories?: CategoryData[];
    team2Categories?: CategoryData[];
    questions?: BoardQuestionData[];
    metadata?: {
      fallbacksUsed?: number;
    };
  };
}

export interface GameState {
  status: GameStatus;
  team1: Team;
  team2: Team;
  timerDuration: number;
  categoriesPerTeam: 2 | 3 | 4 | 5;
  currentTurn: 1 | 2;
  currentQuestionIndex: number;
  gamePack: GamePack | null;
  removedOptionIndices: number[];
  lastAnswerCorrect: boolean | null;
  lastCorrectAnswerIndex: number | null;
  pointsAwarded: number | null;
}

export type AidType = keyof Team['aidsRemaining'];

export type GameAction =
  | { type: 'START_SETUP'; team1Name: string; team2Name: string; timerDuration: number; categoriesPerTeam?: 2 | 3 | 4 | 5 }
  | { type: 'SET_TEAM_CATEGORIES'; team: 1 | 2; categoryIds: string[] }
  | { type: 'START_GAME'; gamePack: GamePack }
  | { type: 'SUBMIT_ANSWER'; answerIndex: number | null }
  | { type: 'ADVANCE_TURN' }
  | { type: 'USE_AID'; team: 1 | 2; aidType: AidType }
  | { type: 'SET_REMOVED_OPTIONS'; indices: number[] }
  | { type: 'AWARD_POINTS'; team: 1 | 2 | null; points: number }
  | { type: 'SWITCH_TURN' }
  | { type: 'END_GAME' }
  | { type: 'RESET_GAME' };

export interface TimerState {
  status: 'idle' | 'running' | 'paused' | 'frozen' | 'expired';
  durationSeconds: number;
  remainingMs: number;
  startedAtMs: number | null;
  pausedAtMs: number | null;
  freezeExpiresAtMs: number | null;
}

export type TimerAction =
  | { type: 'START'; durationSeconds: number; nowMs?: number }
  | { type: 'TICK'; nowMs: number }
  | { type: 'PAUSE'; nowMs: number }
  | { type: 'RESUME'; nowMs: number }
  | { type: 'FREEZE'; durationSeconds: number; nowMs: number }
  | { type: 'RESET' };
