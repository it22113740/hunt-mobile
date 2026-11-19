import { api } from '@/api/client';
import { profileSchema, type Profile } from '@/features/profile/schemas';

export async function savePushToken(pushToken: string): Promise<Profile> {
  const { data } = await api.patch<unknown>('/users/me', { pushToken });
  return profileSchema.parse(data);
}
