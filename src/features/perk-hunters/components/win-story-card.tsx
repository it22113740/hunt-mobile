import { ScribbleUnderline } from '@/components/ui/typography';
import { perkWord } from '@/features/perk-hunters/format';
import type { MonthlyWin } from '@/features/perk-hunters/schemas';
import { isTamil, TAMIL_FONT } from '@/lib/tamil';
import { ArrowRight, Trophy } from 'lucide-react-native';
import { useId } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Defs, Pattern, Polygon, Rect } from 'react-native-svg';

const BASE_WIDTH = 360;
const INK = '#1D1915';
const PAPER = '#F6F3EC';
const ORANGE = '#FC6401';
const MUTE = '#6E675F';

type WinStoryCardProps = {
  win: MonthlyWin;
  width?: number;
};

/** Square share card. Size scales from a 360-wide layout so the preview and the captured image match. */
export function WinStoryCard({ win, width = BASE_WIDTH }: WinStoryCardProps) {
  const scale = width / BASE_WIDTH;
  const prize = win.prize;
  const title = prize?.title || 'Prize on its way';
  const partner = prize?.partner || 'Hunt';
  const titleFont = isTamil(title) ? TAMIL_FONT : 'BricolageGrotesque_800ExtraBold';
  const partnerFont = isTamil(partner) ? TAMIL_FONT : 'BricolageGrotesque_600SemiBold';
  const bareName = win.username.replace(/^@/, '').trim() || 'Hunter';
  const initial = Array.from(bareName)[0]?.toLocaleUpperCase() ?? 'H';
  const monthStamp = win.monthName.slice(0, 3).toUpperCase();

  return (
    <View
      collapsable={false}
      style={{
        width,
        height: width,
        backgroundColor: PAPER,
        overflow: 'hidden',
        paddingHorizontal: 16 * scale,
        paddingTop: 16 * scale,
        paddingBottom: 14 * scale,
      }}>
      <PaperDots />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <HuntMark size={26 * scale} />
        <Text
          style={{
            fontFamily: 'IBMPlexMono_500Medium',
            fontSize: 9 * scale,
            letterSpacing: 0.8 * scale,
            color: ORANGE,
          }}>
          {`PERK HUNTERS  ·  ${monthStamp} ${win.year}`}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14 * scale }}>
        <View style={{ flex: 1, paddingRight: 8 * scale }}>
          <ScribbleUnderline>
            <Text
              style={{
                fontFamily: 'BricolageGrotesque_800ExtraBold',
                fontSize: 32 * scale,
                lineHeight: 34 * scale,
                color: INK,
              }}>
              I topped
            </Text>
          </ScribbleUnderline>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={{
              marginTop: 6 * scale,
              fontFamily: 'BricolageGrotesque_800ExtraBold',
              fontSize: 38 * scale,
              lineHeight: 40 * scale,
              color: INK,
            }}>
            {`${win.monthName}.`}
          </Text>
        </View>
        <TrophyBadge size={72 * scale} />
      </View>

      <Text style={{ marginTop: 10 * scale, fontFamily: 'BricolageGrotesque_500Medium', fontSize: 13 * scale, lineHeight: 18 * scale, color: MUTE }}>
        {'#1 on Hunt with '}
        <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', color: INK }}>
          {`${win.perks} ${perkWord(win.perks)} redeemed`}
        </Text>
        {' last month.'}
      </Text>

      <View
        style={{
          marginTop: 12 * scale,
          borderWidth: 1.5,
          borderStyle: 'dashed',
          borderColor: '#E39A62',
          borderRadius: 16 * scale,
          backgroundColor: '#FFF8F2',
          paddingHorizontal: 12 * scale,
          paddingTop: 10 * scale,
          paddingBottom: 12 * scale,
        }}>
        <View
          style={{
            position: 'absolute',
            top: -7 * scale,
            right: 22 * scale,
            width: 46 * scale,
            height: 14 * scale,
            borderRadius: 2 * scale,
            backgroundColor: '#D5D0C8',
            transform: [{ rotate: '-8deg' }],
          }}
        />
        <Text
          style={{
            fontFamily: 'IBMPlexMono_500Medium',
            fontSize: 9 * scale,
            letterSpacing: 0.6 * scale,
            color: ORANGE,
          }}>
          I WON  ·  FROM HUNT.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 * scale, marginTop: 4 * scale }}>
          <Text
            numberOfLines={2}
            style={{
              flex: 1,
              fontFamily: titleFont,
              fontSize: 16 * scale,
              lineHeight: 20 * scale,
              color: INK,
            }}>
            {title}
          </Text>
          <Text
            numberOfLines={2}
            style={{
              width: 88 * scale,
              fontFamily: partnerFont,
              fontSize: 12 * scale,
              lineHeight: 15 * scale,
              color: MUTE,
              textAlign: 'right',
            }}>
            {partner}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 * scale }}>
        <View
          style={{
            width: 36 * scale,
            height: 36 * scale,
            borderRadius: 18 * scale,
            borderWidth: 2,
            borderColor: ORANGE,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFFDF9',
          }}>
          <Text
            style={{
              fontFamily: isTamil(initial) ? TAMIL_FONT : 'BricolageGrotesque_800ExtraBold',
              fontSize: 16 * scale,
              color: INK,
            }}>
            {initial}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 13 * scale, color: INK }}>
            {`@${bareName}`}
          </Text>
          <Text style={{ fontFamily: 'Caveat_600SemiBold', fontSize: 16 * scale, lineHeight: 16 * scale, color: ORANGE }}>
            beat that!
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6 * scale,
            backgroundColor: '#161616',
            borderRadius: 999,
            paddingLeft: 12 * scale,
            paddingRight: 5 * scale,
            paddingVertical: 5 * scale,
          }}>
          <Text numberOfLines={1} style={{ fontFamily: 'BricolageGrotesque_700Bold', fontSize: 11 * scale, color: '#FFFFFF' }}>
            Get Hunt on Google Play
          </Text>
          <View
            style={{
              width: 22 * scale,
              height: 22 * scale,
              borderRadius: 11 * scale,
              backgroundColor: ORANGE,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <ArrowRight color="#FFFFFF" size={12 * scale} strokeWidth={2.6} />
          </View>
        </View>
      </View>
    </View>
  );
}

function HuntMark({ size }: { size: number }) {
  const dot = Math.round(size * 0.32);
  return (
    <View accessibilityLabel="hunt" style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text
        style={{
          fontFamily: 'BricolageGrotesque_800ExtraBold',
          fontSize: size,
          lineHeight: Math.round(size * 1.05),
          letterSpacing: -size * 0.04,
          color: INK,
        }}>
        hunt
      </Text>
      <View
        style={{
          width: dot,
          height: dot,
          borderRadius: dot,
          backgroundColor: ORANGE,
          marginLeft: 1,
          marginBottom: Math.round(size * 0.18),
        }}
      />
    </View>
  );
}

function TrophyBadge({ size }: { size: number }) {
  return (
    <View style={{ width: size * 1.25, height: size * 1.15, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          position: 'absolute',
          width: size * 1.15,
          height: size * 1.15,
          borderRadius: size,
          backgroundColor: 'rgba(252,100,1,0.16)',
        }}
      />
      <Spark size={size * 0.16} style={{ position: 'absolute', top: 0, right: size * 0.02 }} />
      <Spark size={size * 0.12} style={{ position: 'absolute', bottom: size * 0.08, left: 0 }} />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: ORANGE,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Trophy color="#FFFFFF" size={size * 0.46} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function Spark({ size, style }: { size: number; style?: StyleProp<ViewStyle> }) {
  const c = size / 2;
  const inner = size * 0.2;
  const points = [
    [c, 0],
    [c + inner * 0.35, c - inner],
    [size, c],
    [c + inner * 0.35, c + inner],
    [c, size],
    [c - inner * 0.35, c + inner],
    [0, c],
    [c - inner * 0.35, c - inner],
  ]
    .map(([x, y]) => `${x},${y}`)
    .join(' ');
  return (
    <Svg width={size} height={size} style={style}>
      <Polygon points={points} fill={ORANGE} />
    </Svg>
  );
}

function PaperDots() {
  const id = `storyDots${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id={id} width={16} height={16} patternUnits="userSpaceOnUse">
          <Circle cx={1.2} cy={1.2} r={1.15} fill="rgba(70,64,58,0.28)" />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}
