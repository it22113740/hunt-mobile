import { ConfirmDialog } from '@/components/confirm-dialog';
import { useListRefresh } from '@/components/list-refresh';
import { EmptyState } from '@/components/empty-state';
import { SkeletonBlock, SkeletonScreen } from '@/components/skeleton';
import { DashRule, Doodle } from '@/components/ui/decor';
import { ScreenEnter } from '@/components/ui/enter';
import { BackHeader } from '@/components/ui/screen-header';
import { Body } from '@/components/ui/typography';
import { AlertsCard } from '@/features/notifications/components/alerts-card';
import { GuestStanding } from '@/features/perk-hunters/components/guest-standing';
import { usePerkHunterSummary } from '@/features/perk-hunters/hooks';
import { AvatarPicker } from '@/features/profile/components/avatar-picker';
import { ChangePasswordForm } from '@/features/profile/components/change-password-form';
import { ProfileForm } from '@/features/profile/components/profile-form';
import { useProfile } from '@/features/profile/hooks';
import { useAuthStore } from '@/stores/auth';
import { useSurfaces } from '@/theme/surfaces';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isJournal, isWhite } = useSurfaces();
  const profile = useProfile();
  const isGuest = profile.data?.role === 'USER';
  const standing = usePerkHunterSummary(isGuest);
  const logout = useAuthStore((state) => state.logout);
  const refreshControl = useListRefresh(isGuest ? [profile, standing] : [profile]);
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const confirmLogout = () => {
    setConfirmingLogout(false);
    void logout().then(() => {
      router.replace('/(auth)/login');
    });
  };

  if (profile.isPending) return <SkeletonScreen label="Loading profile" shape="profile" />;

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      {profile.isError ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            title="Couldn’t load your profile"
            detail="Check your connection and try again."
            action="Try again"
            onPress={() => {
              void profile.refetch();
            }}
          />
        </View>
      ) : null}

      {profile.data ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 40, gap: 28 }}
            refreshControl={refreshControl}
            style={{ flex: 1 }}>
            {isWhite ? (
              <>
                <Doodle kind="sparkle" size={18} accent style={{ left: 210, top: 74 }} />
                <Doodle kind="sparkle" size={10} style={{ left: 234, top: 98 }} />
              </>
            ) : null}
            <BackHeader label="Profile" />
            <AvatarPicker profile={profile.data} levelName={isGuest ? standing.data?.level.name : null} />
            {isGuest ? (
              standing.isPending ? (
                <View style={{ gap: 12 }}>
                  <SkeletonBlock height={120} style={{ marginBottom: 0 }} />
                  <SkeletonBlock height={88} style={{ marginBottom: 0 }} />
                </View>
              ) : standing.isError || !standing.data ? (
                <EmptyState
                  title="Couldn’t load your level"
                  detail="Your profile is fine. Perk Hunters didn’t load."
                  action="Try again"
                  onPress={() => void standing.refetch()}
                />
              ) : (
                <GuestStanding summary={standing.data} />
              )
            ) : null}
            <ProfileForm profile={profile.data} />
            <DashRule width={isJournal ? 1.5 : 1} />
            <ChangePasswordForm hasPassword={profile.data.hasPassword} />
            <DashRule width={isJournal ? 1.5 : 1} />
            <AlertsCard role={profile.data.role} pushToken={profile.data.pushToken} />
            <Pressable
              accessibilityRole="button"
              onPress={() => setConfirmingLogout(true)}
              hitSlop={8}
              style={{ alignSelf: 'center', padding: 12 }}>
              <Body size={15} weight="bold" color={colors.danger}>
                Log out
              </Body>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      ) : null}

      <ConfirmDialog
        visible={confirmingLogout}
        title="Log out?"
        detail="You can sign back in anytime."
        confirmLabel="Log out"
        tone="danger"
        onConfirm={confirmLogout}
        onClose={() => setConfirmingLogout(false)}
      />

      {!profile.isPending && !profile.isError && !profile.data ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState title="No profile yet" detail="Sign in again if this keeps happening." />
        </View>
      ) : null}
    </ScreenEnter>
  );
}
