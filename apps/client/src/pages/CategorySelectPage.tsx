import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { CategoryGrid } from '../components/categories/CategoryGrid';
import { PageFrame } from '../components/shared/PageFrame';
import { PageTransition } from '../components/shared/PageTransition';
import { useGameContext } from '../hooks/useGameContext';
import { getAllCategories } from '../services/categories-api';
import { generateBoardGamePack } from '../services/game-pack-api';
import type { CategoryData } from '../state/types';

export function CategorySelectPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useGameContext();
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const categoriesPerTeam = state.categoriesPerTeam ?? 3;

  const getApiErrorMessage = useCallback((value: unknown) => {
    if (!axios.isAxiosError(value)) {
      return t('categories.error');
    }
    if (!value.response) {
      return t('categories.networkError');
    }
    if (value.response.status === 422) {
      return t('categories.insufficientQuestions');
    }
    if (value.response.status >= 500) {
      return t('categories.serverError');
    }
    return t('categories.error');
  }, [t]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [getApiErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const canStart = state.team1.selectedCategoryIds.length === categoriesPerTeam
    && state.team2.selectedCategoryIds.length === categoriesPerTeam;

  const activeTeam = useMemo(() => {
    if (state.team1.selectedCategoryIds.length < categoriesPerTeam) {
      return 1;
    }
    return 2;
  }, [categoriesPerTeam, state.team1.selectedCategoryIds.length]);

  const onSelect = (categoryId: string) => {
    const inTeam1 = state.team1.selectedCategoryIds.includes(categoryId);
    const inTeam2 = state.team2.selectedCategoryIds.includes(categoryId);

    if (inTeam1) {
      dispatch({
        type: 'SET_TEAM_CATEGORIES',
        team: 1,
        categoryIds: state.team1.selectedCategoryIds.filter((id) => id !== categoryId),
      });
      return;
    }

    if (inTeam2) {
      dispatch({
        type: 'SET_TEAM_CATEGORIES',
        team: 2,
        categoryIds: state.team2.selectedCategoryIds.filter((id) => id !== categoryId),
      });
      return;
    }

    if (activeTeam === 1 && state.team1.selectedCategoryIds.length < categoriesPerTeam) {
      dispatch({
        type: 'SET_TEAM_CATEGORIES',
        team: 1,
        categoryIds: [...state.team1.selectedCategoryIds, categoryId],
      });
      return;
    }

    if (activeTeam === 2 && state.team2.selectedCategoryIds.length < categoriesPerTeam) {
      dispatch({
        type: 'SET_TEAM_CATEGORIES',
        team: 2,
        categoryIds: [...state.team2.selectedCategoryIds, categoryId],
      });
    }
  };

  const onStart = async () => {
    if (!canStart) {
      return;
    }

    try {
      setSubmitting(true);
      const pack = await generateBoardGamePack(state.team1.selectedCategoryIds, state.team2.selectedCategoryIds);
      dispatch({ type: 'START_GAME', gamePack: pack });
      navigate('/game');
    } catch (submitError) {
      setError(getApiErrorMessage(submitError));
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => {
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
  };

  return (
    <PageFrame>
      <PageTransition transitionKey="categories">
        <div className="card p-6 space-y-4 min-h-[520px]">
          <h1 className="text-5xl text-gold">{t('categories.title')}</h1>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded border border-team1/50 bg-[rgba(230,62,103,0.12)] p-3">
              <p className="text-sm font-display tracking-[0.12em] text-team1">{state.team1.name}</p>
              <p className="font-score text-2xl text-team1">{state.team1.selectedCategoryIds.length}/{categoriesPerTeam}</p>
            </div>
            <div className="rounded border border-team2/50 bg-[rgba(47,141,240,0.12)] p-3 text-right">
              <p className="text-sm font-display tracking-[0.12em] text-team2">{state.team2.name}</p>
              <p className="font-score text-2xl text-team2">{state.team2.selectedCategoryIds.length}/{categoriesPerTeam}</p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-3">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-gold-muted border-t-gold" />
              <p>{t('categories.loading')}</p>
            </div>
          ) : null}
          {error ? (
            <div className="space-y-2 rounded border border-wrong/40 bg-[rgba(255,71,87,0.08)] p-4">
              <p className="text-wrong">{error}</p>
              <button type="button" className="card px-4 py-2" onClick={() => void load()}>{t('categories.retry')}</button>
            </div>
          ) : null}

          {!loading && !error && categories.length > 0 ? (
            <CategoryGrid
              categories={categories}
              team1Ids={state.team1.selectedCategoryIds}
              team2Ids={state.team2.selectedCategoryIds}
              onSelect={onSelect}
            />
          ) : null}
          {!loading && !error && categories.length === 0 ? (
            <div className="rounded border border-gold-muted/40 bg-bg-surface/40 p-4">
              <p className="text-wrong">{t('categories.empty')}</p>
            </div>
          ) : null}

          <button
            type="button"
            className="w-full bg-gold text-bg-base font-display text-3xl py-3 disabled:opacity-50"
            onClick={() => void onStart()}
            disabled={!canStart || submitting}
          >
            {submitting ? t('categories.generating') : t('categories.startButton')}
          </button>
          <button
            type="button"
            className="w-full border border-gold-muted text-ivory font-display text-2xl py-2"
            onClick={onCancel}
            disabled={submitting}
          >
            {t('categories.cancel')}
          </button>
        </div>
      </PageTransition>
    </PageFrame>
  );
}
