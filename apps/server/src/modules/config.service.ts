import { env } from '../config/env';

export function getPublicConfig() {
  return {
    questionsPerGame: env.QUESTIONS_PER_GAME,
    categoriesToDisplay: env.CATEGORIES_TO_DISPLAY,
    categoriesPerTeam: env.CATEGORIES_PER_TEAM,
  };
}
