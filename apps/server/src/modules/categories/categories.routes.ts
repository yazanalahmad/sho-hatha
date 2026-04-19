import { Router } from 'express';
import { getAllCategoriesController, getRandomCategoriesController } from './categories.controller';

export const categoriesRouter = Router();

categoriesRouter.get('/', (req, res, next) => {
  getAllCategoriesController(req, res).catch(next);
});

categoriesRouter.get('/random', (req, res, next) => {
  getRandomCategoriesController(req, res).catch(next);
});
