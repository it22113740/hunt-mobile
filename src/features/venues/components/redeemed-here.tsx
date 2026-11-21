import { SkeletonBlock } from '@/components/skeleton';
import { Card } from '@/components/ui/card';
import { DashRule } from '@/components/ui/decor';
import { PressScale } from '@/components/ui/press-scale';
import { Body, Hand, ScribbleUnderline, Sub } from '@/components/ui/typography';
import { PerkShotCard, shotInitial } from '@/features/venues/components/perk-shot-card';
import { formatCount } from '@/features/perk-hunters/format';
import type { PerkShot, RedeemedBoard } from '@/features/venues/schemas';
import { isTamil, TAMIL_FONT } from '@/lib/tamil';
import { useSurfaces } from '@/theme/surfaces';
import { ChevronRight } from 'lucide-react-native';
import { Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native';

type RedeemedHereProps = {
  board?: RedeemedBoard;
  pending: boolean;
  error: boolean;
  onRetry: () => void;
  onOpen: (shot: PerkShot) => void;
  onSeeAll: () => void;
};

export function RedeemedHere({ board, pending, error, onRetry, onOpen, onSeeAll }: RedeemedHereProps) {
  const { colors } = useSurfaces();
  const { width } = useWindowDimensions();
  const gap = 10;
  const card = Math.floor((Math.min(width, 520) - 40 - gap * 2) / 3);

  if (pending) return <RedeemedHereSkeleton card={card} gap={gap} />;
  if (error || !board) {
    return (
      <PressScale accessibilityRole="button" onPress={onRetry}>
        <Body size={15} weight="semibold" color={colors.accentDeep}>
          Couldn’t load redeemed perks. Tap to try again.
        </Body>
      </PressScale>
    );
  }

  const faces = uniqueFaces(board.preview);
  const top = board.topPerk ? `  ·  TOP: ${board.topPerk.toUpperCase()}` : '';

  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ backgroundColor: colors.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 10, letterSpacing: 0.6, color: colors.onAccent }}>NEW</Text>
        </View>
        <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, letterSpacing: 0.8, color: colors.mute }}>
          {`ON HUNT SINCE ${board.sinceLabel}`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', flex: 1 }}>
          <Text style={{ fontFamily: 'BricolageGrotesque_700Bold', fontSize: 28, lineHeight: 32, color: colors.ink }}>Redeemed </Text>
          <ScribbleUnderline>
            <Text style={{ fontFamily: 'BricolageGrotesque_700Bold', fontSize: 28, lineHeight: 32, color: colors.ink }}>here</Text>
          </ScribbleUnderline>
        </View>
        <Hand size={18} style={{ textAlign: 'right' }}>
          real guests, real plates
        </Hand>
      </View>

      <Card>
        <View style={{ flexDirection: 'row' }}>
          <Stat value={board.people} label={board.people === 1 ? 'person redeemed' : 'people redeemed'} />
          <DashRule vertical />
          <Stat value={board.perks} label={board.perks === 1 ? 'perk swapped' : 'perks swapped'} />
        </View>
        <DashRule />
        <View style={{ flexDirection: 'row' }}>
          <Stat value={board.photos} label={board.photos === 1 ? 'photo submitted' : 'photos submitted'} />
          <DashRule vertical />
          <Stat value={board.videos} label={board.videos === 1 ? 'video submitted' : 'videos submitted'} />
        </View>
      </Card>

      <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, letterSpacing: 0.4, color: colors.accentDeep }}>
        {`+${formatCount(board.thisWeek)} THIS WEEK  ·  ${formatCount(board.cameBack)} CAME BACK${top}`}
      </Text>

      {board.preview.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
          {board.preview.map((shot) => (
            <PerkShotCard key={shot.id} shot={shot} width={card} onPress={() => onOpen(shot)} />
          ))}
        </View>
      ) : (
        <Sub>{board.people === 0 ? 'No guest has redeemed here yet.' : 'No plates yet. A guest can snap the perk after they redeem it.'}</Sub>
      )}

      {board.shots > 6 ? (
        <PressScale
          accessibilityRole="button"
          accessibilityLabel={`See all ${board.people} guests`}
          onPress={onSeeAll}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            borderWidth: 1.5,
            borderColor: colors.ink,
            borderRadius: 999,
            paddingLeft: 8,
            paddingRight: 14,
            paddingVertical: 8,
          }}>
          {faces.length > 0 ? (
            <View style={{ flexDirection: 'row' }}>
              {faces.map((shot, index) => (
                <View
                  key={shot.username}
                  style={{
                    marginLeft: index === 0 ? 0 : -8,
                    width: 28,
                    height: 28,
                    borderRadius: 14,
                    borderWidth: 1.5,
                    borderColor: colors.ink,
                    backgroundColor: index === 1 ? colors.blush : colors.card,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontFamily: isTamil(shotInitial(shot.username)) ? TAMIL_FONT : 'BricolageGrotesque_800ExtraBold',
                      fontSize: 12,
                      color: colors.ink,
                    }}>
                    {shotInitial(shot.username)}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
          <Text style={{ flex: 1, fontFamily: 'BricolageGrotesque_700Bold', fontSize: 15, color: colors.ink }}>
            {`See all ${formatCount(board.people)} ${board.people === 1 ? 'guest' : 'guests'}`}
          </Text>
          <ChevronRight color={colors.ink} size={18} />
        </PressScale>
      ) : null}

      <Sub size={13}>Snapped at the counter when a perk is swapped, with the guest’s OK.</Sub>
    </View>
  );
}

function RedeemedHereSkeleton({ card, gap }: { card: number; gap: number }) {
  const { colors } = useSurfaces();
  const photo = card - 10;
  return (
    <View accessibilityLabel="Loading redeemed perks" style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Bone height={16} width={36} radius={4} />
        <Bone height={12} width={148} radius={4} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <Bone height={32} width={168} radius={6} />
        <Bone height={18} width={92} radius={4} />
      </View>
      <Card>
        <View style={{ flexDirection: 'row' }}>
          <StatBone />
          <DashRule vertical />
          <StatBone />
        </View>
        <DashRule />
        <View style={{ flexDirection: 'row' }}>
          <StatBone />
          <DashRule vertical />
          <StatBone />
        </View>
      </Card>
      <Bone height={12} width="78%" radius={4} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <View
            key={index}
            style={{
              width: card,
              backgroundColor: '#FFFFFF',
              paddingTop: 5,
              paddingHorizontal: 5,
              paddingBottom: 10,
              borderRadius: 2,
            }}>
            <Bone height={photo} width={photo} radius={2} />
            <Bone height={13} width="72%" radius={4} style={{ marginTop: 8, marginHorizontal: 4 }} />
            <Bone height={10} width="54%" radius={4} style={{ marginTop: 6, marginHorizontal: 4 }} />
          </View>
        ))}
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          borderWidth: 1.5,
          borderColor: colors.line,
          borderRadius: 999,
          paddingLeft: 8,
          paddingRight: 14,
          paddingVertical: 8,
        }}>
        <View style={{ flexDirection: 'row' }}>
          {[0, 1, 2].map((index) => (
            <Bone key={index} height={28} width={28} radius={14} style={{ marginLeft: index === 0 ? 0 : -8 }} />
          ))}
        </View>
        <Bone height={15} width={140} radius={4} />
      </View>
      <Bone height={13} width="88%" radius={4} />
    </View>
  );
}

function StatBone() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 8 }}>
      <Bone height={28} width={48} radius={4} />
      <Bone height={13} width="72%" radius={4} />
    </View>
  );
}

function Bone({
  height,
  width,
  radius = 4,
  style,
}: {
  height: number;
  width: number | `${number}%`;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return <SkeletonBlock height={height} width={width} radius={radius} style={[{ marginBottom: 0 }, style]} />;
}

function Stat({ value, label }: { value: number; label: string }) {
  const { colors } = useSurfaces();
  return (
    <View style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, gap: 2 }}>
      <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 28, lineHeight: 32, letterSpacing: -0.8, color: colors.ink }}>
        {formatCount(value)}
      </Text>
      <Text style={{ fontFamily: 'BricolageGrotesque_500Medium', fontSize: 13, color: colors.mute }}>{label}</Text>
    </View>
  );
}

function uniqueFaces(shots: PerkShot[]) {
  const seen = new Set<string>();
  const faces: PerkShot[] = [];
  for (const shot of shots) {
    if (seen.has(shot.username)) continue;
    seen.add(shot.username);
    faces.push(shot);
    if (faces.length === 3) break;
  }
  return faces;
}
