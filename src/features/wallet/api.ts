import { api } from '@/api/client';
import { uploadOne, type VisitFile } from '@/features/capture/api';
import { savedPerkShotSchema } from '@/features/venues/schemas';
import { pointsSchema, redemptionListSchema, redemptionSchema, type PointsBalance, type Redemption } from '@/features/wallet/schemas';

export async function fetchMyPoints(): Promise<PointsBalance> {
  const { data } = await api.get<unknown>('/users/me/points');
  return pointsSchema.parse(data);
}

export async function fetchMyRedemptions(): Promise<Redemption[]> {
  const { data } = await api.get<unknown>('/redemptions/mine');
  return redemptionListSchema.parse(data);
}

export async function redeemPerk(perkId: string): Promise<Redemption> {
  const { data } = await api.post<unknown>('/redemptions', { perkId });
  const parsed = redemptionSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('The perk was redeemed, but no code came back.');
  }
  return parsed.data;
}

export async function addPerkShot(redemptionId: string, file: VisitFile) {
  const uploaded = await uploadOne(file);
  const { data } = await api.post<unknown>(`/redemptions/${redemptionId}/shot`, { mediaUrl: uploaded.mediaUrl });
  return savedPerkShotSchema.parse(data);
}
