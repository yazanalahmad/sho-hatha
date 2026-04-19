import { Router } from 'express';
import { getPublicConfig } from './config.service';

export const configRouter = Router();

configRouter.get('/', (_req, res) => {
  res.json(getPublicConfig());
});
