import { queryKeys } from '@/api/keys';
import { fetchHallOfFame, fetchPerkHunterBoard, fetchPerkHunterSummary } from '@/features/perk-hunters/api';
import { useQuery } from '@tanstack/react-query';

export function usePerkHunterSummary(enabled = true) {
  return useQuery({
    queryKey: [...queryKeys.perkHunters, 'me'],
    queryFn: fetchPerkHunterSummary,
    enabled,
  });
}

export function usePerkHunterBoard() {
  return useQuery({
    queryKey: [...queryKeys.perkHunters, 'board'],
    queryFn: fetchPerkHunterBoard,
  });
}

export function useHallOfFame() {
  return useQuery({
    queryKey: [...queryKeys.perkHunters, 'hall'],
    queryFn: fetchHallOfFame,
  });
}
