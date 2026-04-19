import type { GameAction, GamePack, GameState, QuestionData, Team } from './types';

const baseTeam = (color: Team['color']): Team => ({
  name: '',
  color,
  score: 0,
  selectedCategoryIds: [],
  aidsRemaining: {
    fiftyFifty: 1,
    skip: 1,
    freezeTimer: 1,
  },
});

export const initialGameState: GameState = {
  status: 'idle',
  team1: baseTeam('team1'),
  team2: baseTeam('team2'),
  timerDuration: 0,
  categoriesPerTeam: 3,
  currentTurn: 1,
  currentQuestionIndex: 0,
  gamePack: null,
  removedOptionIndices: [],
  lastAnswerCorrect: null,
  lastCorrectAnswerIndex: null,
  pointsAwarded: null,
};

function getCurrentQuestion(state: GameState): QuestionData | null {
  const pack = state.gamePack?.pack;
  if (!pack || !pack.team1Questions || !pack.team2Questions) {
    return null;
  }

  const teamQuestions = state.currentTurn === 1 ? pack.team1Questions : pack.team2Questions;
  const teamIndex = Math.floor(state.currentQuestionIndex / 2);
  return teamQuestions[teamIndex] ?? null;
}

function applyScore(state: GameState, points: number): GameState {
  if (state.currentTurn === 1) {
    return { ...state, team1: { ...state.team1, score: state.team1.score + points } };
  }
  return { ...state, team2: { ...state.team2, score: state.team2.score + points } };
}

function scoreForDifficulty(difficulty: QuestionData['difficulty']): 1 | 2 | 3 {
  if (difficulty === 'easy') return 1;
  if (difficulty === 'medium') return 2;
  return 3;
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_SETUP':
      return {
        ...initialGameState,
        status: 'categorySelection',
        team1: { ...state.team1, ...baseTeam('team1'), name: action.team1Name },
        team2: { ...state.team2, ...baseTeam('team2'), name: action.team2Name },
        timerDuration: action.timerDuration,
        categoriesPerTeam: action.categoriesPerTeam ?? 3,
      };

    case 'SET_TEAM_CATEGORIES':
      return action.team === 1
        ? { ...state, team1: { ...state.team1, selectedCategoryIds: action.categoryIds } }
        : { ...state, team2: { ...state.team2, selectedCategoryIds: action.categoryIds } };

    case 'START_GAME':
      return {
        ...state,
        status: 'playing',
        gamePack: action.gamePack,
        currentQuestionIndex: 0,
        currentTurn: 1,
        removedOptionIndices: [],
        lastAnswerCorrect: null,
        lastCorrectAnswerIndex: null,
        pointsAwarded: null,
      };

    case 'SUBMIT_ANSWER': {
      const question = getCurrentQuestion(state);
      if (!question) {
        return state;
      }

      const correct = action.answerIndex === question.correct_answer_index;
      const points = correct ? scoreForDifficulty(question.difficulty) : 0;
      const withScore = applyScore(state, points);

      return {
        ...withScore,
        status: 'answerFeedback',
        lastAnswerCorrect: correct,
        lastCorrectAnswerIndex: question.correct_answer_index,
        pointsAwarded: points,
      };
    }

    case 'ADVANCE_TURN': {
      const nextQuestionIndex = state.currentQuestionIndex + 1;
      if (nextQuestionIndex >= 18) {
        return {
          ...state,
          status: 'results',
          currentQuestionIndex: 18,
          removedOptionIndices: [],
        };
      }

      return {
        ...state,
        status: 'playing',
        currentQuestionIndex: nextQuestionIndex,
        currentTurn: state.currentTurn === 1 ? 2 : 1,
        removedOptionIndices: [],
        lastAnswerCorrect: null,
        lastCorrectAnswerIndex: null,
        pointsAwarded: null,
      };
    }

    case 'AWARD_POINTS': {
      if (!action.team || action.points <= 0) {
        return state;
      }
      const teamKey = action.team === 1 ? 'team1' : 'team2';
      return {
        ...state,
        [teamKey]: {
          ...state[teamKey],
          score: state[teamKey].score + action.points,
        },
      };
    }

    case 'SWITCH_TURN':
      return {
        ...state,
        currentTurn: state.currentTurn === 1 ? 2 : 1,
      };

    case 'END_GAME':
      return {
        ...state,
        status: 'results',
      };

    case 'USE_AID': {
      const teamKey = action.team === 1 ? 'team1' : 'team2';
      const targetTeam = state[teamKey];
      if (targetTeam.aidsRemaining[action.aidType] <= 0) {
        return state;
      }

      return {
        ...state,
        [teamKey]: {
          ...targetTeam,
          aidsRemaining: {
            ...targetTeam.aidsRemaining,
            [action.aidType]: targetTeam.aidsRemaining[action.aidType] - 1,
          },
        },
      };
    }

    case 'SET_REMOVED_OPTIONS':
      return {
        ...state,
        removedOptionIndices: action.indices,
      };

    case 'RESET_GAME':
      return initialGameState;

    default:
      return state;
  }
}

export function getQuestionForTurn(pack: GamePack, turn: 1 | 2, questionIndex: number): QuestionData | null {
  if (!pack.pack.team1Questions || !pack.pack.team2Questions) {
    return null;
  }
  const teamQuestions = turn === 1 ? pack.pack.team1Questions : pack.pack.team2Questions;
  return teamQuestions[Math.floor(questionIndex / 2)] ?? null;
}
