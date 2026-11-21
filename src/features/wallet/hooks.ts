import { queryKeys } from '@/api/keys';
import { queryClient } from '@/api/query-client';
import type { VisitFile } from '@/features/capture/api';
import { addPerkShot, fetchMyPoints, fetchMyRedemptions, redeemPerk } from '@/features/wallet/api';
import type { Redemption } from '@/features/wallet/schemas';
import { useMutation, useQuery } from '@tanstack/react-query';

export function useMyPoints() {
  return useQuery({
    queryKey: queryKeys.myPoints,
    queryFn: fetchMyPoints,
  });
}

export function useMyRedemptions() {
  return useQuery({
    queryKey: queryKeys.myRedemptions,
    queryFn: fetchMyRedemptions,
  });
}

export function useRedeemPerk() {
  return useMutation({
    mutationFn: redeemPerk,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.myPoints }),
        queryClient.invalidateQueries({ queryKey: queryKeys.myRedemptions }),
        queryClient.invalidateQueries({ queryKey: queryKeys.perkHunters }),
      ]);
    },
  });
}

export function useAddPerkShot() {
  return useMutation({
    mutationFn: ({ redemptionId, file }: { redemptionId: string; file: VisitFile }) => addPerkShot(redemptionId, file),
    onSuccess: async (shot) => {
      queryClient.setQueryData<Redemption[] | undefined>(queryKeys.myRedemptions, (current) =>
        current?.map((item) => (item.id === shot.redemptionId ? { ...item, shot: { mediaUrl: shot.mediaUrl } } : item)),
      );
      await queryClient.invalidateQueries({ queryKey: ['venues', shot.venueId, 'redeemed'] });
    },
  });
}
