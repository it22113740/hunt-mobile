import { EmptyState } from '@/components/empty-state';
import { showToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { Tape } from '@/components/ui/decor';
import { ScreenEnter } from '@/components/ui/enter';
import { IconButton } from '@/components/ui/icon-button';
import { Body, Label, Sub } from '@/components/ui/typography';
import { useGivePrize, useLookupCode, useMarkRedemptionUsed } from '@/features/owner/hooks';
import type { ScanResult } from '@/features/owner/schemas';
import { getApiErrorMessage } from '@/lib/api-error';
import { monthDay } from '@/lib/dates';
import { MotionView } from '@/components/ui/animated';
import { useHuntColors } from '@/theme/colors';
import { useSurfaces } from '@/theme/surfaces';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function codeParam(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw ?? '').trim();
}

export function ScanResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useSurfaces();
  const params = useLocalSearchParams<{ code?: string | string[] }>();
  const code = codeParam(params.code);
  const lookup = useLookupCode(code);
  const markUsed = useMarkRedemptionUsed();
  const give = useGivePrize();
  const busy = markUsed.isPending || give.isPending;

  function scanAnother() {
    router.replace('/(owner)/scan');
  }

  function confirm(result: ScanResult) {
    if (result.kind === 'perk') {
      markUsed.mutate(result.id, {
        onSuccess: () => {
          showToast('Marked used');
          void lookup.refetch();
        },
        onError: (error) => showToast(getApiErrorMessage(error, 'Could not mark this code used.'), 'warning'),
      });
      return;
    }
    give.mutate(result.id, {
      onSuccess: () => showToast('Prize given'),
      onError: (error) => showToast(getApiErrorMessage(error, 'Could not give this prize.'), 'warning'),
    });
  }

  if (!code) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <IconButton icon={X} label="Close" onPress={() => router.back()} />
          <EmptyState title="No code to look up" action="Scan a code" onPress={scanAnother} />
        </View>
      </ScreenEnter>
    );
  }

  if (lookup.isPending) {
    return <ScanLookup code={code} onClose={() => router.back()} />;
  }

  if (lookup.isError || !lookup.data) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <IconButton icon={X} label="Close" onPress={() => router.back()} />
          <EmptyState
            title="No offer for that code"
            detail={getApiErrorMessage(lookup.error, 'Check the code and try again.')}
            action="Scan another"
            onPress={scanAnother}
          />
        </View>
      </ScreenEnter>
    );
  }

  const result = lookup.data;
  const ready = result.kind === 'perk' ? result.mine && result.status === 'ISSUED' : result.mine && result.status === 'READY' && Boolean(result.title);

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <IconButton icon={X} label="Close" onPress={() => router.back()} />
          <Label color={colors.accentDeep}>
            {result.kind === 'perk' ? 'Perk code' : `Perk hunters · ${result.monthName}`}
          </Label>
        </View>
        <OfferCard result={result} />
        <Note result={result} />
        <View style={{ marginTop: 16, gap: 8 }}>
          <Meta label={result.kind === 'perk' ? 'Guest' : 'Winner'} value={result.guest} />
          {result.kind === 'perk' ? (
            <>
              <Meta label="Redeemed" value={monthDay(result.redeemedAt)} />
              <Meta label="Works" value="Once, at this shop" />
            </>
          ) : (
            <Meta label="Perks" value={`${result.perks} in ${result.monthName}`} />
          )}
        </View>
        <View style={{ marginTop: 'auto', gap: 10, paddingTop: 20 }}>
          <Button
            label={result.kind === 'perk' ? 'Mark used' : 'Give this prize'}
            disabled={!ready}
            loading={busy}
            onPress={() => confirm(result)}
          />
          <Button label="Scan another" variant="secondary" onPress={scanAnother} />
        </View>
      </View>
    </ScreenEnter>
  );
}

function ScanLookup({ code, onClose }: { code: string; onClose: () => void }) {
  const insets = useSafeAreaInsets();
  const colors = useHuntColors();

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
        <IconButton icon={X} label="Close" onPress={onClose} />
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Looking up the offer"
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, paddingBottom: insets.bottom + 48 }}>
        <SweepingFrame />
        <Text
          style={{
            marginTop: 28,
            fontFamily: 'BricolageGrotesque_700Bold',
            fontSize: 26,
            lineHeight: 30,
            color: colors.ink,
            textAlign: 'center',
          }}>
          Looking up the offer
        </Text>
        <Text
          style={{
            marginTop: 8,
            fontFamily: 'IBMPlexMono_500Medium',
            fontSize: 14,
            letterSpacing: 1,
            color: colors.accentDeep,
            textAlign: 'center',
          }}>
          {code}
        </Text>
      </View>
    </ScreenEnter>
  );
}

function SweepingFrame() {
  const colors = useHuntColors();
  const reduceMotion = useReducedMotion();
  const travel = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) return;
    travel.set(withRepeat(withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.quad) }), -1, true));
  }, [reduceMotion, travel]);

  const line = useAnimatedStyle(() => ({
    transform: [{ translateY: 18 + travel.get() * 128 }],
  }));
  const corner = {
    position: 'absolute' as const,
    width: 26,
    height: 26,
    borderColor: colors.accent,
  };

  return (
    <View style={{ width: 168, height: 168 }}>
      <View style={[corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
      <View style={[corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
      <MotionView style={[{ position: 'absolute', left: 16, right: 16, top: 0, height: 3, borderRadius: 2, backgroundColor: colors.accent }, line]} />
    </View>
  );
}

function OfferCard({ result }: { result: ScanResult }) {
  const { colors, surfaces } = useSurfaces();
  const blocked = result.kind === 'prize' ? !result.mine || result.status !== 'READY' : result.status === 'USED' || !result.mine;
  const title = result.kind === 'perk' ? result.title : (result.title ?? 'Prize on its way');
  const where = result.kind === 'perk' ? result.place : [result.partner, result.area].filter(Boolean).join(', ');
  const stamp = stampFor(result, colors);

  return (
    <View style={{ marginTop: 22 }}>
      <Tape rotate={-3} style={{ left: 22, top: -8 }} />
      <View
        style={[
          surfaces.soft,
          {
            backgroundColor: blocked && result.kind === 'prize' && !result.mine ? colors.dangerSoft : colors.blush,
            paddingTop: 16,
            paddingHorizontal: 16,
            paddingBottom: 14,
          },
        ]}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <Label color={blocked && !result.mine ? colors.danger : colors.accentDeep}>
            {result.kind === 'perk' ? 'The offer' : 'The prize'}
          </Label>
          <Text
            style={{
              fontFamily: 'IBMPlexMono_500Medium',
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: stamp.color,
              borderWidth: 1.5,
              borderColor: stamp.color,
              borderRadius: 4,
              paddingHorizontal: 7,
              paddingVertical: 2,
              transform: [{ rotate: '-8deg' }],
            }}>
            {stamp.label}
          </Text>
        </View>
        <Text
          style={{
            marginTop: 8,
            fontFamily: 'BricolageGrotesque_700Bold',
            fontSize: 26,
            lineHeight: 30,
            color: colors.ink,
          }}>
          {title}
        </Text>
        {where ? <Sub style={{ marginTop: 6 }}>{where}</Sub> : null}
        <View
          style={{
            marginTop: 14,
            paddingTop: 10,
            borderTopWidth: 1.5,
            borderStyle: 'dashed',
            borderTopColor: colors.lineStrong,
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
          }}>
          <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: colors.ink }}>{result.code}</Text>
          <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 13, color: colors.ink }}>
            {result.kind === 'perk' ? `${result.pointsSpent} pts` : result.validUntilLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

function stampFor(result: ScanResult, colors: { danger: string; mute: string; good: string }) {
  if (result.kind === 'perk') {
    if (!result.mine) return { label: 'Not here', color: colors.danger };
    if (result.status === 'USED') return { label: 'Used', color: colors.mute };
    return { label: 'Ready', color: colors.good };
  }
  if (!result.mine) return { label: 'Not here', color: colors.danger };
  if (result.status === 'GIVEN') return { label: 'Given', color: colors.mute };
  if (result.status === 'EXPIRED') return { label: 'Ended', color: colors.danger };
  return { label: 'Your shop', color: colors.good };
}

function Note({ result }: { result: ScanResult }) {
  const { colors } = useSurfaces();
  const text = noteFor(result);
  const warn = result.kind === 'prize' ? !result.mine || result.status !== 'READY' : !result.mine || result.status === 'USED';
  return (
    <View style={{ marginTop: 12, backgroundColor: warn ? colors.dangerSoft : colors.goodSoft, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 }}>
      <Body size={14}>{text}</Body>
    </View>
  );
}

function noteFor(result: ScanResult) {
  if (result.kind === 'perk') {
    if (!result.mine) return `This perk is for ${result.place}.`;
    if (result.status === 'USED') return result.usedAt ? `Already used on ${monthDay(result.usedAt)}.` : 'Already used.';
    return 'Check the offer, then mark it used. Each code works once.';
  }
  if (!result.partner) return 'Hunt has not named a shop for this prize yet.';
  if (!result.mine) return `This prize is only for ${result.partner}.`;
  if (result.status === 'GIVEN') return result.givenAt ? `Already given on ${monthDay(result.givenAt)}.` : 'Already given.';
  if (result.status === 'EXPIRED') return `This prize ended ${result.validUntilLabel}.`;
  if (!result.title) return 'Hunt has not named this prize yet.';
  return 'This is a Hunt prize for the month’s winner. It does not spend their points.';
}

function Meta({ label, value }: { label: string; value: string }) {
  const { colors } = useSurfaces();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Sub size={14}>{label}</Sub>
      <Body size={15} weight="bold" color={colors.ink} style={{ flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Body>
    </View>
  );
}
