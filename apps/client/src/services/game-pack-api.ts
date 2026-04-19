import api from './api-client';
import type { GamePack } from '../state/types';

export async function generateGamePack(team1CategoryIds: string[], team2CategoryIds: string[]): Promise<GamePack> {
  const res = await api.post<GamePack>('/api/game-packs/generate', {
    team1CategoryIds,
    team2CategoryIds,
  });

  return res.data;
}

export async function generateBoardGamePack(team1CategoryIds: string[], team2CategoryIds: string[]): Promise<GamePack> {
  const res = await api.post<GamePack>('/api/game-packs/generate-board', {
    team1CategoryIds,
    team2CategoryIds,
  });

  return res.data;
}
