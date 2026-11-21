import { api } from '@/api/client';
import {
  boardSchema,
  hallSchema,
  perkHunterSummarySchema,
  type HallOfFame,
  type PerkHunterBoard,
  type PerkHunterSummary,
} from '@/features/perk-hunters/schemas';

export async function fetchPerkHunterSummary(): Promise<PerkHunterSummary> {
  const { data } = await api.get<unknown>('/perk-hunters/me');
  return perkHunterSummarySchema.parse(data);
}

export async function fetchPerkHunterBoard(): Promise<PerkHunterBoard> {
  const { data } = await api.get<unknown>('/perk-hunters/board');
  return boardSchema.parse(data);
}

export async function fetchHallOfFame(): Promise<HallOfFame> {
  const { data } = await api.get<unknown>('/perk-hunters/hall');
  return hallSchema.parse(data);
}
