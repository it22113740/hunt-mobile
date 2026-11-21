import { EmptyState } from '@/components/empty-state';
import { SkeletonBlock } from '@/components/skeleton';
import { Button } from '@/components/ui/button';
import { DashRule, Doodle, Tape } from '@/components/ui/decor';
import { ScreenEnter } from '@/components/ui/enter';
import { IconButton } from '@/components/ui/icon-button';
import { BackHeader } from '@/components/ui/screen-header';
import { Body, Hand, Label, MarkedHeading, Sub } from '@/components/ui/typography';
import { ShareWinSheet } from '@/features/perk-hunters/components/share-win-sheet';
import { VoucherQr } from '@/features/perk-hunters/components/voucher-qr';
import { perkWord } from '@/features/perk-hunters/format';
import { monthDay } from '@/lib/dates';
import { usePerkHunterSummary } from '@/features/perk-hunters/hooks';
import { useSurfaces } from '@/theme/surfaces';
import { useRouter } from 'expo-router';
import { ChevronRight, MapPin, X } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function MonthlyWinnerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, surfaces, isWhite } = useSurfaces();
  const summary = usePerkHunterSummary();
  const [sharing, setSharing] = useState(false);

  if (summary.isPending) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <SkeletonBlock height={24} width={140} />
        <SkeletonBlock height={80} />
        <SkeletonBlock height={180} />
      </ScreenEnter>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <BackHeader label="Perk hunters" />
          <EmptyState
            title="Couldn’t load your win"
            detail="Check your connection and try again."
            action="Try again"
            onPress={() => void summary.refetch()}
          />
        </View>
      </ScreenEnter>
    );
  }

  const win = summary.data.lastWin;
  if (!win) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <BackHeader label="Perk hunters" />
          <EmptyState
            title="No prize waiting"
            detail="This screen opens when you finish a month in first place."
            action="See the board"
            onPress={() => router.replace('/(user)/perk-hunters')}
          />
        </View>
      </ScreenEnter>
    );
  }

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 28 }}>
        {isWhite ? <Doodle kind="sparkle" size={22} accent style={{ right: 28, top: 88 }} /> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <IconButton icon={X} label="Close" onPress={() => router.back()} />
          <Label>Perk hunters</Label>
        </View>
        <Label style={{ marginTop: 28 }}>{`${win.monthName} ${win.year} · winner`}</Label>
        <View style={{ marginTop: 8 }}>
          <MarkedHeading before="You " mark="topped" after={` ${win.monthName}, ${win.username}!`} size={34} />
        </View>
        <Sub style={{ marginTop: 12 }}>
          {`${win.perks} ${perkWord(win.perks)} redeemed, the most of anyone on Hunt last month. Here’s your prize.`}
        </Sub>

        <View style={{ marginTop: 28 }}>
          <Tape rotate={-3} style={{ left: 28, top: -11 }} />
          <View style={[surfaces.soft, { backgroundColor: colors.blush, paddingTop: 20, paddingHorizontal: 18, paddingBottom: 16 }]}>
            <Label color={colors.accentDeep}>Your prize · from Hunt</Label>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 }}>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: 'BricolageGrotesque_700Bold',
                    fontSize: 24,
                    lineHeight: 28,
                    color: colors.ink,
                  }}>
                  {win.prize ? win.prize.title : 'Prize on its way'}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  <MapPin color={colors.mute} size={14} strokeWidth={1.8} />
                  <Sub size={14}>
                    {win.prize ? `${win.prize.partner}, ${win.prize.area}` : 'Hunt will name the partner offer here'}
                  </Sub>
                </View>
              </View>
              <View
                style={{
                  width: 92,
                  height: 92,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: colors.line,
                  backgroundColor: colors.card,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <VoucherQr value={win.voucherCode} />
              </View>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                paddingTop: 12,
                borderTopWidth: 1,
                borderStyle: 'dashed',
                borderTopColor: colors.lineStrong,
              }}>
              <Text selectable style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 14, letterSpacing: 0.8, color: colors.ink }}>
                {win.voucherCode}
              </Text>
              <Label color={colors.accentDeep}>{`Until ${win.validUntilLabel}`}</Label>
            </View>
          </View>
        </View>
        <Sub size={13} style={{ marginTop: 10 }}>
          {win.givenAt ? `Already given on ${monthDay(win.givenAt)}.` : 'Show this at the counter. The staff scan it to redeem.'}
        </Sub>
        <View style={{ marginTop: 24 }}>
          <Button label="Share my win" onPress={() => setSharing(true)} />
        </View>
        <DashRule style={{ marginTop: 36 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16 }}>
          <Hand size={22}>This month’s board is open</Hand>
          <Pressable
            accessibilityRole="link"
            onPress={() => router.replace('/(user)/perk-hunters')}
            style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Body size={15} weight="bold">
              View
            </Body>
            <ChevronRight color={colors.ink} size={16} strokeWidth={1.8} />
          </Pressable>
        </View>
      </ScrollView>
      <ShareWinSheet win={sharing ? win : null} onClose={() => setSharing(false)} />
    </ScreenEnter>
  );
}
