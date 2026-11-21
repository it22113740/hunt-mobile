import { RedeemedScreen } from '@/features/venues/screens/redeemed-screen';
import { useLocalSearchParams } from 'expo-router';

export default function RedeemedRoute() {
  const { id } = useLocalSearchParams<{ id?: string | string[] }>();
  const venueId = Array.isArray(id) ? id[0] : id;
  if (!venueId) return null;
  return <RedeemedScreen venueId={venueId} />;
}
