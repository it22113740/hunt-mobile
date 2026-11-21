import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyState } from '@/components/empty-state';
import { useListRefresh } from '@/components/list-refresh';
import { ScreenState } from '@/components/screen-state';
import { ActionMenu } from '@/components/ui/action-menu';
import { Doodle } from '@/components/ui/decor';
import { ListEnter, ScreenEnter } from '@/components/ui/enter';
import { useTabBarInset } from '@/components/ui/tab-bar';
import { Body, Hand, MarkedHeading, Sub } from '@/components/ui/typography';
import { AddTile } from '@/features/owner/components/add-tile';
import { PerkCard, perkTypeLabel } from '@/features/owner/components/perk-preview';
import { useDeletePerk, useMyPerks, useOwnerRedemptions, useSetPerkActive } from '@/features/owner/hooks';
import type { OwnerPerk } from '@/features/owner/schemas';
import { getApiErrorMessage } from '@/lib/api-error';
import { useSurfaces } from '@/theme/surfaces';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PerksScreen() {
  const insets = useSafeAreaInsets();
  const tabInset = useTabBarInset();
  const router = useRouter();
  const { colors, isWhite } = useSurfaces();
  const perks = useMyPerks();
  const redemptions = useOwnerRedemptions();
  const remove = useDeletePerk();
  const setActive = useSetPerkActive();
  const [pending, setPending] = useState<OwnerPerk | null>(null);
  const [turningOff, setTurningOff] = useState<OwnerPerk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const refreshControl = useListRefresh([perks, redemptions]);
  const rows = perks.data ?? [];

  const claimed = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of redemptions.data ?? []) counts.set(item.perk.id, (counts.get(item.perk.id) ?? 0) + 1);
    return counts;
  }, [redemptions.data]);

  if (perks.isPending) return <ScreenState loading skeleton="perks" title="Loading perks" />;
  if (perks.isError) {
    return (
      <ScreenState
        title="Couldn’t load perks"
        detail="Check your connection and try again."
        action="Try again"
        onPress={() => void perks.refetch()}
      />
    );
  }

  const addPerk = () => router.push('/(owner)/perk/new');

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <FlatList
        style={{ flex: 1 }}
        data={rows}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: tabInset, flexGrow: 1 }}
        refreshControl={refreshControl}
        ItemSeparatorComponent={() => <View style={{ height: 18 }} />}
        ListHeaderComponent={
          <View style={{ gap: 8, marginBottom: 18 }}>
            <MarkedHeading mark="Perks" size={28} marked={isWhite} />
            <Sub>Turn a perk off to hide it. Turn it on again whenever you like.</Sub>
            {error ? (
              <Body size={14} color={colors.danger} style={{ marginTop: 6 }}>
                {error}
              </Body>
            ) : null}
          </View>
        }
        renderItem={({ item, index }) => {
          const edit = () => router.push(`/(owner)/perk/${item.id}`);
          const kind =
            item.type === 'DISCOUNT' && item.discountPercent != null
              ? `${perkTypeLabel[item.type]} · ${item.discountPercent}% off`
              : perkTypeLabel[item.type];
          return (
            <ListEnter index={index}>
              <PerkCard
                title={item.title}
                subtitle={`${item.venue?.name ?? 'Your place'} · ${kind}`}
                imageUrl={item.imageUrl}
                onPress={edit}
                accessibilityLabel={`${item.title}, ${item.pointsRequired} points, ${item.active ? 'on' : 'off'}. Edit perk`}
                stats={[
                  { key: 'points', value: item.pointsRequired, label: 'Points', tone: 'accent' },
                  {
                    key: 'claimed',
                    value: redemptions.isSuccess ? (claimed.get(item.id) ?? 0) : '–',
                    label: 'Claimed',
                  },
                  {
                    key: 'status',
                    value: item.active ? 'On' : 'Off',
                    label: 'Status',
                    tone: item.active ? 'good' : 'mute',
                  },
                ]}
                right={
                  <ActionMenu
                    label={`${item.title} options`}
                    status={{
                      label: item.active ? 'Turn off' : 'Turn on',
                      onPress: () =>
                        item.active
                          ? setTurningOff(item)
                          : setActive.mutate(
                              { id: item.id, active: true },
                              {
                                onError: (activeError) =>
                                  setError(getApiErrorMessage(activeError, 'Could not turn this perk on.')),
                              },
                            ),
                    }}
                    onEdit={edit}
                    onDelete={() => setPending(item)}
                    style={{ borderColor: colors.lineStrong }}
                  />
                }
              />
            </ListEnter>
          );
        }}
        ListFooterComponent={
          rows.length > 0 ? (
            <View style={{ paddingTop: 18, gap: 18 }}>
              <AddTile label="Add a perk" onPress={addPerk} />
              <Hand style={{ alignSelf: 'center', textAlign: 'center', transform: [{ rotate: '-1deg' }] }}>
                a cheap first perk gets people coming back
              </Hand>
              {isWhite ? (
                <View style={{ height: 150 }} pointerEvents="none">
                  <Doodle kind="cocktail" size={46} rotate={-8} style={{ left: 30, top: 10 }} />
                  <Doodle kind="mug" size={44} rotate={8} style={{ right: 40, top: 30 }} />
                  <Doodle kind="star" size={22} accent rotate={10} style={{ left: 150, top: 50 }} />
                  <Doodle kind="squiggle" size={110} style={{ left: 100, top: 130 }} />
                </View>
              ) : null}
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <EmptyState
            illustration="empty-perks"
            title="No perks yet"
            detail="Add an offer guests can redeem with their points."
            note="a cheap first perk gets people coming back"
            action="Add a perk"
            onPress={addPerk}
          />
        }
      />
      <ConfirmDialog
        visible={Boolean(turningOff)}
        title={`Turn off ${turningOff?.title ?? 'this perk'}?`}
        detail="Guests will not see it until you turn it on. Codes already given still work."
        confirmLabel="Turn off"
        onClose={() => setTurningOff(null)}
        onConfirm={() => {
          if (!turningOff) return;
          const id = turningOff.id;
          setTurningOff(null);
          setActive.mutate(
            { id, active: false },
            { onError: (activeError) => setError(getApiErrorMessage(activeError, 'Could not turn this perk off.')) },
          );
        }}
      />
      <ConfirmDialog
        visible={Boolean(pending)}
        title={`Delete ${pending?.title ?? 'this perk'}?`}
        detail="Guests will no longer be able to redeem it."
        confirmLabel="Delete perk"
        tone="danger"
        onClose={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return;
          const id = pending.id;
          setPending(null);
          remove.mutate(id, {
            onError: (deleteError) => setError(getApiErrorMessage(deleteError, 'Could not delete this perk.')),
          });
        }}
      />
    </ScreenEnter>
  );
}
