import { CachedImage } from '@/components/cached-image';
import { PressScale } from '@/components/ui/press-scale';
import type { PerkShot } from '@/features/venues/schemas';
import { isTamil, TAMIL_FONT } from '@/lib/tamil';
import { useHuntColors } from '@/theme/colors';
import { Text, View } from 'react-native';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function shotStamp(value: string) {
  const date = new Date(value);
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function shotInitial(username: string) {
  const first = Array.from(username.trim())[0];
  return first ? first.toLocaleUpperCase() : 'H';
}

type PerkShotCardProps = {
  shot: PerkShot;
  width: number;
  onPress: () => void;
  /** Gallery cards carry the guest initial and the day. The store grid leaves those off. */
  detailed?: boolean;
};

export function PerkShotCard({ shot, width, onPress, detailed = false }: PerkShotCardProps) {
  const colors = useHuntColors();
  const photo = width - 10;
  const nameFont = isTamil(shot.username) ? TAMIL_FONT : 'BricolageGrotesque_800ExtraBold';
  const perkFont = isTamil(shot.perkTitle) ? TAMIL_FONT : 'IBMPlexMono_500Medium';

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`Photo by ${shot.username} of ${shot.perkTitle}`}
      onPress={onPress}
      style={{
        width,
        backgroundColor: '#FFFFFF',
        paddingTop: 5,
        paddingHorizontal: 5,
        paddingBottom: 10,
        borderRadius: 2,
        boxShadow: '0px 8px 18px -10px rgba(24,24,26,0.35)',
      }}>
      <CachedImage
        source={{ uri: shot.mediaUrl }}
        style={{ width: photo, height: photo, backgroundColor: colors.placeholder }}
        contentFit="cover"
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: detailed ? 8 : 8, paddingHorizontal: 4 }}>
        {detailed ? (
          <View
            style={{
              width: 22,
              height: 22,
              borderRadius: 11,
              borderWidth: 1.5,
              borderColor: colors.ink,
              backgroundColor: colors.paper,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text style={{ fontFamily: isTamil(shotInitial(shot.username)) ? TAMIL_FONT : 'BricolageGrotesque_800ExtraBold', fontSize: 11, color: colors.ink }}>
              {shotInitial(shot.username)}
            </Text>
          </View>
        ) : null}
        <Text numberOfLines={1} style={{ flex: 1, fontFamily: nameFont, fontSize: 13, color: colors.ink }}>
          {`@${shot.username}`}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginTop: 2, paddingHorizontal: 4 }}>
        <Text
          numberOfLines={2}
          style={{
            flex: 1,
            fontFamily: perkFont,
            fontSize: 10,
            letterSpacing: isTamil(shot.perkTitle) ? 0 : 0.4,
            textTransform: isTamil(shot.perkTitle) ? 'none' : 'uppercase',
            color: colors.mute,
          }}>
          {shot.perkTitle}
        </Text>
        {detailed ? (
          <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 10, color: colors.mute }}>{shotStamp(shot.createdAt)}</Text>
        ) : null}
      </View>
    </PressScale>
  );
}
