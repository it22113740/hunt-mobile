import { Button } from '@/components/ui/button';
import { Tape, Ticks } from '@/components/ui/decor';
import { Body, H1, Hand, Label, Sub } from '@/components/ui/typography';
import { formatCount, perkWord } from '@/features/perk-hunters/format';
import { levelIcon } from '@/features/perk-hunters/level-icons';
import type { PerkHunterSummary } from '@/features/perk-hunters/schemas';
import { useSurfaces } from '@/theme/surfaces';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type GuestStandingProps = {
  summary: PerkHunterSummary;
};

export function GuestStanding({ summary }: GuestStandingProps) {
  const router = useRouter();
  const { colors, surfaces } = useSurfaces();
  const Icon = levelIcon(summary.level.number);
  const NextIcon = summary.next ? levelIcon(summary.next.number) : null;
  const { month } = summary;

  const standingLine =
    month.rank !== null && month.rank <= 3
      ? "You're on the podium."
      : month.toPodium !== null
        ? `${month.toPodium} more to reach the top 3`
        : 'Redeem a perk to join this month’s board.';

  return (
    <View style={{ gap: 16 }}>
      {summary.lastWin ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`You topped ${summary.lastWin.monthName}`}
          onPress={() => router.push('/(user)/perk-win')}
          style={[surfaces.raised, { padding: 16, gap: 4 }]}>
          <Label color={colors.accentDeep}>Last month</Label>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Body size={16} weight="bold" style={{ flex: 1 }}>
              {`You topped ${summary.lastWin.monthName}`}
            </Body>
            <ChevronRight color={colors.ink} size={18} strokeWidth={1.8} />
          </View>
          <Sub size={13}>Your prize voucher is ready.</Sub>
        </Pressable>
      ) : null}

      <View style={[surfaces.soft, { backgroundColor: colors.blush, padding: 16, gap: 12 }]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Label color={colors.accentDeep}>{`Level ${summary.level.number} of 12`}</Label>
          <Label>
            {summary.next
              ? `${formatCount(summary.lifetimeRedemptions)} / ${formatCount(summary.next.minRedemptions)}`
              : formatCount(summary.lifetimeRedemptions)}
          </Label>
        </View>
        <Ticks progress={summary.progress} />
        {summary.next && NextIcon ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.line,
              borderRadius: 12,
              padding: 10,
            }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1.5,
                borderStyle: 'dashed',
                borderColor: colors.lineStrong,
              }}>
              <NextIcon color={colors.faint} size={20} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Label>{`Next · level ${summary.next.number}`}</Label>
              <Body size={16} weight="bold">
                {summary.next.name}
              </Body>
              <Sub size={13}>{summary.next.unlocks}</Sub>
            </View>
            <Hand size={18} style={{ textAlign: 'right' }}>
              {`${formatCount(summary.toGo)}\nto go`}
            </Hand>
          </View>
        ) : (
          <Hand>You’ve reached the top. Hunt Master.</Hand>
        )}
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/(user)/levels')}
          style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Body size={15} weight="bold">
            See all 12 levels
          </Body>
          <ChevronRight color={colors.ink} size={18} strokeWidth={1.8} />
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Stat value={formatCount(summary.points)} label="Points" />
        <Stat value={formatCount(summary.lifetimeRedemptions)} label="Perks" />
        <Stat value={formatCount(summary.spots)} label="Spots" />
      </View>

      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Label>{`Perk hunters · ${month.label}`}</Label>
          <Hand size={20}>{`${month.daysLeft} ${month.daysLeft === 1 ? 'day' : 'days'} left`}</Hand>
        </View>
        <View style={[surfaces.card, { padding: 16, gap: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
            <H1 size={52} style={{ lineHeight: 52 }}>
              {month.rank === null ? '–' : `#${month.rank}`}
            </H1>
            <View style={{ flex: 1, paddingBottom: 6 }}>
              <Body size={16} weight="semibold">
                {`${month.perks} ${perkWord(month.perks)} redeemed`}
              </Body>
              <Sub size={14}>{standingLine}</Sub>
            </View>
            <Icon color={colors.accent} size={22} strokeWidth={1.8} />
          </View>
          <Button label="See the leaderboard" onPress={() => router.push('/(user)/perk-hunters')} />
        </View>
        <Pressable accessibilityRole="link" onPress={() => router.push('/(user)/perk-hunters')}>
          <View>
            <Tape rotate={3} style={{ right: 28, top: -10 }} />
            <View
              style={[
                surfaces.soft,
                {
                  backgroundColor: colors.blush,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 16,
                },
              ]}>
              <Label color={colors.accentDeep} style={{ width: 92 }}>
                {`#1 wins\nfrom Hunt`}
              </Label>
              <View style={{ flex: 1 }}>
                <Body size={16} weight="semibold">
                  {month.prize ? month.prize.title : 'Prize still to come'}
                </Body>
                <Sub size={13}>
                  {month.prize ? `${month.prize.partner}, ${month.prize.area}` : 'A small offer from a partner'}
                </Sub>
              </View>
              <ChevronRight color={colors.ink} size={18} strokeWidth={1.8} />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const { colors, surfaces } = useSurfaces();
  return (
    <View style={[surfaces.soft, { flex: 1, padding: 12 }]}>
      <Body size={22} weight="bold">
        {value}
      </Body>
      <Label style={{ color: colors.mute }}>{label}</Label>
    </View>
  );
}

