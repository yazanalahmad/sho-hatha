import { Router } from 'express';
import { requireAdminToken } from '../../middleware/require-admin-token';
import {
  createCategoryController,
  createQuestionController,
  deleteCategoryController,
  deleteQuestionController,
  getCategoryController,
  getQuestionController,
  listCategoriesController,
  listQuestionsController,
  toggleCategoryController,
  toggleQuestionController,
  updateCategoryController,
  updateQuestionController,
} from './admin.controller';

export const adminRouter = Router();

adminRouter.use(requireAdminToken);

adminRouter.get('/questions', (req, res, next) => {
  listQuestionsController(req, res).catch(next);
});
adminRouter.get('/questions/:id', (req, res, next) => {
  getQuestionController(req, res).catch(next);
});
adminRouter.post('/questions', (req, res, next) => {
  createQuestionController(req, res).catch(next);
});
adminRouter.put('/questions/:id', (req, res, next) => {
  updateQuestionController(req, res).catch(next);
});
adminRouter.patch('/questions/:id/toggle-active', (req, res, next) => {
  toggleQuestionController(req, res).catch(next);
});
adminRouter.delete('/questions/:id', (req, res, next) => {
  deleteQuestionController(req, res).catch(next);
});

adminRouter.get('/categories', (req, res, next) => {
  listCategoriesController(req, res).catch(next);
});
adminRouter.get('/categories/:id', (req, res, next) => {
  getCategoryController(req, res).catch(next);
});
adminRouter.post('/categories', (req, res, next) => {
  createCategoryController(req, res).catch(next);
});
adminRouter.put('/categories/:id', (req, res, next) => {
  updateCategoryController(req, res).catch(next);
});
adminRouter.patch('/categories/:id/toggle-active', (req, res, next) => {
  toggleCategoryController(req, res).catch(next);
});
adminRouter.delete('/categories/:id', (req, res, next) => {
  deleteCategoryController(req, res).catch(next);
});
