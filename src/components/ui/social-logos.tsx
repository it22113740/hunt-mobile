import { useHuntColors } from '@/theme/colors';
import { Linking, Pressable, View } from 'react-native';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

type SocialKind = 'tiktok' | 'instagram' | 'facebook';

type StoreSocialsProps = {
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
};

const SIZE = 28;

export function StoreSocials({ instagramUrl, facebookUrl, tiktokUrl }: StoreSocialsProps) {
  const items = (
    [
      ['tiktok', tiktokUrl],
      ['instagram', instagramUrl],
      ['facebook', facebookUrl],
    ] as const
  ).filter((item): item is [SocialKind, string] => Boolean(item[1]?.trim()));

  if (!items.length) return null;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 6 }}>
      {items.map(([kind, value]) => (
        <Pressable
          key={kind}
          accessibilityRole="link"
          accessibilityLabel={labelFor(kind)}
          hitSlop={6}
          onPress={() => {
            const href = socialHref(kind, value);
            if (href) void Linking.openURL(href);
          }}>
          <SocialLogo kind={kind} />
        </Pressable>
      ))}
    </View>
  );
}

function labelFor(kind: SocialKind) {
  if (kind === 'tiktok') return 'TikTok';
  if (kind === 'instagram') return 'Instagram';
  return 'Facebook';
}

function socialHref(kind: SocialKind, value: string) {
  const raw = value.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const handle = raw.replace(/^@/, '');
  if (kind === 'instagram') return `https://instagram.com/${handle}`;
  if (kind === 'facebook') return `https://facebook.com/${handle}`;
  return `https://www.tiktok.com/@${handle}`;
}

function SocialLogo({ kind }: { kind: SocialKind }) {
  const colors = useHuntColors();
  if (kind === 'facebook') {
    return (
      <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="12" fill="#1877F2" />
        <Path
          d="M13.4 18.2v-5h1.7l.3-1.9h-2v-1.2c0-.6.2-1 .9-1h1.1V7.2c-.2 0-1-.1-1.9-.1-1.9 0-3.2 1.2-3.2 3.3v1.5H8.5v1.9h1.8v5h3.1z"
          fill={colors.card}
        />
      </Svg>
    );
  }
  if (kind === 'instagram') {
    return (
      <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
        <Rect width="24" height="24" rx="6" fill="#E1306C" />
        <Rect x="6" y="6" width="12" height="12" rx="3.2" fill="none" stroke={colors.card} strokeWidth="1.6" />
        <Circle cx="12" cy="12" r="2.6" fill="none" stroke={colors.card} strokeWidth="1.6" />
        <Circle cx="16.2" cy="7.8" r="0.9" fill={colors.card} />
      </Svg>
    );
  }
  return (
    <Svg width={SIZE} height={SIZE} viewBox="0 0 24 24">
      <Circle cx="12" cy="12" r="12" fill={colors.ink} />
      <Path
        d="M14.2 7.2c.5 1.1 1.3 1.9 2.4 2.2v1.7a4.6 4.6 0 0 1-2.4-.7v4.4a3.6 3.6 0 1 1-3.1-3.6v1.8a1.8 1.8 0 1 0 1.3 1.7V7.2h1.8z"
        fill="#25F4EE"
      />
      <Path
        d="M14.6 7.6c.5 1 1.2 1.8 2.2 2.1v1.5a4.4 4.4 0 0 1-2.2-.7v4.2a3.4 3.4 0 1 1-2.9-3.4v1.7a1.6 1.6 0 1 0 1.1 1.5V7.6h1.8z"
        fill="#FE2C55"
      />
      <Path
        d="M14.4 7.4c.5 1 1.2 1.8 2.3 2.1v1.6a4.5 4.5 0 0 1-2.3-.7v4.3a3.5 3.5 0 1 1-3-3.5v1.7a1.7 1.7 0 1 0 1.2 1.6V7.4h1.8z"
        fill={colors.card}
      />
    </Svg>
  );
}
