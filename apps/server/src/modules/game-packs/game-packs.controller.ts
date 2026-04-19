import type { Request, Response } from 'express';
import { generateBoardGamePackSchema, generateGamePackSchema } from './game-packs.schemas';
import { generateBoardGamePack, generateGamePack } from './game-packs.service';

export async function generateGamePackController(req: Request, res: Response): Promise<void> {
  const payload = generateGamePackSchema.parse(req.body);
  const pack = await generateGamePack(payload);
  res.status(200).json(pack);
}

export async function generateBoardGamePackController(req: Request, res: Response): Promise<void> {
  const payload = generateBoardGamePackSchema.parse(req.body);
  const pack = await generateBoardGamePack(payload);
  res.status(200).json(pack);
}
