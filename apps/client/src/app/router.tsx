import { createBrowserRouter, Navigate } from 'react-router-dom';
import { CategorySelectPage } from '../pages/CategorySelectPage';
import { ErrorPage } from '../pages/ErrorPage';
import { GamePage } from '../pages/GamePage';
import { ResultsPage } from '../pages/ResultsPage';
import { SetupPage } from '../pages/SetupPage';

export const router = createBrowserRouter([
  { path: '/', element: <SetupPage />, errorElement: <ErrorPage /> },
  { path: '/categories', element: <CategorySelectPage />, errorElement: <ErrorPage /> },
  { path: '/game', element: <GamePage />, errorElement: <ErrorPage /> },
  { path: '/results', element: <ResultsPage />, errorElement: <ErrorPage /> },
  { path: '*', element: <Navigate to="/" replace />, errorElement: <ErrorPage /> },
]);
