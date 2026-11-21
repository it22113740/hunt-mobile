import { useHuntColors } from '@/theme/colors';
import { Stack } from 'expo-router';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function UserLayout() {
  const colors = useHuntColors();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.paper },
      }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="levels" />
      <Stack.Screen name="perk-hunters" />
      <Stack.Screen name="perk-win" />
      <Stack.Screen name="location" />
      <Stack.Screen name="permissions" />
      <Stack.Screen name="venue/[id]" />
      <Stack.Screen name="redeemed/[id]" />
    </Stack>
  );
}
