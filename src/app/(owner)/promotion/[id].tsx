import { PromotionEditScreen } from '@/features/owner/screens/promotion-edit-screen';
import { useLocalSearchParams } from 'expo-router';

export default function EditPromotionRoute() {
  const { id, turnOn } = useLocalSearchParams<{ id?: string | string[]; turnOn?: string | string[] }>();
  const promotionId = Array.isArray(id) ? id[0] : id;
  const turningOn = (Array.isArray(turnOn) ? turnOn[0] : turnOn) === '1';
  return <PromotionEditScreen promotionId={promotionId} turnOn={turningOn} />;
}
