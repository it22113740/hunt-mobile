import { EmptyState } from '@/components/empty-state';
import { useListRefresh } from '@/components/list-refresh';
import { SkeletonBlock } from '@/components/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Doodle, Tape } from '@/components/ui/decor';
import { ScreenEnter } from '@/components/ui/enter';
import { BackHeader } from '@/components/ui/screen-header';
import { Body, H1, Label, MarkedHeading, Sub } from '@/components/ui/typography';
import { endsInLabel, perkWord } from '@/features/perk-hunters/format';
import { useHallOfFame, usePerkHunterBoard } from '@/features/perk-hunters/hooks';
import type { Hunter } from '@/features/perk-hunters/schemas';
import { useSurfaces } from '@/theme/surfaces';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function PerkHuntersScreen() {
  const insets = useSafeAreaInsets();
  const { colors, surfaces, isWhite } = useSurfaces();
  const [tab, setTab] = useState<'month' | 'hall'>('month');
  const board = usePerkHunterBoard();
  const hall = useHallOfFame();
  const refreshControl = useListRefresh([board, hall]);

  if (board.isPending || hall.isPending) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <SkeletonBlock height={24} width={160} />
        <SkeletonBlock height={72} />
        <SkeletonBlock height={120} />
        <SkeletonBlock height={220} />
      </ScreenEnter>
    );
  }

  if (board.isError || hall.isError || !board.data || !hall.data) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <BackHeader label="Perk hunters" />
          <EmptyState
            title="Couldn’t load Perk Hunters"
            detail="Check your connection and try again."
            action="Try again"
            onPress={() => {
              void board.refetch();
              void hall.refetch();
            }}
          />
        </View>
      </ScreenEnter>
    );
  }

  const hunters = board.data.hunters;
  const [first, second, third] = hunters;
  const rest = hunters.slice(3);

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 32 }}>
        {isWhite ? <Doodle kind="sparkle" size={18} accent style={{ right: 18, top: 92 }} /> : null}
        <BackHeader label="Perk hunters" />
        <Label style={{ marginTop: 22 }}>{`${board.data.monthLabel} · all places`}</Label>
        <View style={{ marginTop: 8 }}>
          <MarkedHeading before="Who's redeeming the " mark="most" after=" this month?" size={32} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 18 }}>
          <Pill label="This month" active={tab === 'month'} onPress={() => setTab('month')} />
          <Pill label="Hall of fame" active={tab === 'hall'} onPress={() => setTab('hall')} />
        </View>

        {tab === 'month' ? (
          <View style={{ marginTop: 20 }}>
            <View>
              <Tape ash rotate={-2} style={{ right: 36, top: -10 }} />
              <View
                style={[
                  surfaces.soft,
                  {
                    backgroundColor: colors.blush,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 14,
                    paddingHorizontal: 16,
                  },
                ]}>
                <View style={{ flex: 1 }}>
                  <Label color={colors.accentDeep}>#1 wins · from Hunt</Label>
                  <Body size={17} weight="bold" style={{ marginTop: 4 }}>
                    {board.data.prize ? board.data.prize.title : 'Prize still to come'}
                  </Body>
                  <Sub size={13}>
                    {board.data.prize
                      ? `${board.data.prize.partner} · ${board.data.prize.area}`
                      : 'A small offer from a partner, presented by Hunt'}
                  </Sub>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Label color={colors.accentDeep}>Ends in</Label>
                  <H1 size={22}>{endsInLabel(board.data.endsAt)}</H1>
                </View>
              </View>
            </View>

            {hunters.length === 0 ? (
              <View style={{ paddingVertical: 36 }}>
                <Body size={16} weight="bold">
                  No perks redeemed this month yet.
                </Body>
                <Sub style={{ marginTop: 6 }}>Yours could be the first. The board resets on the 1st.</Sub>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 22 }}>
                {second ? <PodiumSpot hunter={second} height={70} /> : <View style={{ flex: 1 }} />}
                {first ? <PodiumSpot hunter={first} height={96} winner /> : null}
                {third ? <PodiumSpot hunter={third} height={54} /> : <View style={{ flex: 1 }} />}
              </View>
            )}

            <View style={{ marginTop: 14 }}>
              {rest.map((hunter) => (
                <View
                  key={hunter.userId}
                  accessibilityLabel={`Rank ${hunter.rank}, ${hunter.isMe ? 'you' : hunter.username}, ${hunter.perks} perks`}
                  style={[
                    {
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                    },
                    hunter.isMe
                      ? { backgroundColor: colors.blush, borderWidth: 1.5, borderColor: colors.accent, borderRadius: 14 }
                      : { borderBottomWidth: 1, borderBottomColor: colors.line },
                  ]}>
                  <Label style={{ width: 24 }}>{String(hunter.rank).padStart(2, '0')}</Label>
                  <Avatar imageUrl={hunter.imageUrl} name={hunter.username} />
                  <View style={{ flex: 1 }}>
                    <Body size={15} weight="semibold">
                      {hunter.isMe ? `You · ${hunter.username}` : hunter.username}
                    </Body>
                  </View>
                  <Label style={{ color: colors.ink }}>{`${hunter.perks} ${perkWord(hunter.perks)}`}</Label>
                </View>
              ))}
            </View>
            <Sub size={12} style={{ marginTop: 20 }}>
              1 perk redeemed = 1 point. The board resets on the 1st. Ties go to whoever got there first.
            </Sub>
          </View>
        ) : (
          <View style={{ marginTop: 20, gap: 10 }}>
            {hall.data.winners.length === 0 ? (
              <View style={{ paddingVertical: 28 }}>
                <Body size={16} weight="bold">
                  No winners yet.
                </Body>
                <Sub style={{ marginTop: 6 }}>The first board closes on the 1st.</Sub>
              </View>
            ) : (
              hall.data.winners.map((winner) => (
                <View
                  key={winner.monthKey}
                  style={[surfaces.soft, { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 }]}>
                  <Avatar imageUrl={winner.imageUrl} name={winner.username} size={44} />
                  <View style={{ flex: 1 }}>
                    <Label>{winner.monthLabel}</Label>
                    <Body size={15} weight="semibold">
                      {winner.isMe ? `You · ${winner.username}` : winner.username}
                    </Body>
                    <Sub size={12}>
                      {winner.prizeTitle
                        ? `${winner.perks} ${perkWord(winner.perks)} · won ${winner.prizeTitle}`
                        : `${winner.perks} ${perkWord(winner.perks)}`}
                    </Sub>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>
    </ScreenEnter>
  );
}

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const { colors } = useSurfaces();
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        height: 40,
        paddingHorizontal: 18,
        borderRadius: 20,
        borderWidth: 1.5,
        justifyContent: 'center',
        backgroundColor: active ? colors.ink : colors.card,
        borderColor: active ? colors.ink : colors.lineStrong,
      }}>
      <Body size={15} weight="semibold" color={active ? colors.card : colors.ink}>
        {label}
      </Body>
    </Pressable>
  );
}

function PodiumSpot({ hunter, height, winner = false }: { hunter: Hunter; height: number; winner?: boolean }) {
  const { colors } = useSurfaces();
  return (
    <View
      accessibilityLabel={`Rank ${hunter.rank}, ${hunter.username}, ${hunter.perks} perks`}
      style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      {winner ? <Doodle kind="sparkle" size={14} accent style={{ position: 'absolute', right: 8, top: -6 }} /> : null}
      <Avatar imageUrl={hunter.imageUrl} name={hunter.username} size={winner ? 60 : 50} accent={winner} />
      <Body size={13} weight={winner ? 'bold' : 'semibold'} numberOfLines={1}>
        {hunter.username}
      </Body>
      <View
        style={{
          width: '100%',
          height,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: winner ? colors.ink : colors.placeholder,
          borderWidth: winner ? 0 : 1,
          borderColor: colors.line,
        }}>
        <H1 size={winner ? 28 : 22} color={winner ? colors.card : colors.ink}>
          {String(hunter.rank)}
        </H1>
        <Label color={winner ? colors.accent : colors.mute}>{`${hunter.perks} ${perkWord(hunter.perks)}`}</Label>
      </View>
    </View>
  );
}
