import { Router } from 'express';
import { generateBoardGamePackController, generateGamePackController } from './game-packs.controller';

export const gamePacksRouter = Router();

gamePacksRouter.post('/generate', (req, res, next) => {
  generateGamePackController(req, res).catch(next);
});

gamePacksRouter.post('/generate-board', (req, res, next) => {
  generateBoardGamePackController(req, res).catch(next);
});
