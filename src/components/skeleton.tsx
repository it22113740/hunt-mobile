import { MotionView } from '@/components/ui/animated';
import { useSurfaces } from '@/theme/surfaces';
import { useEffect, type ReactNode } from 'react';
import { View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SkeletonBlockProps = {
  height: number;
  width?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function SkeletonBlock({ height, width = '100%', radius = 8, style }: SkeletonBlockProps) {
  const { colors } = useSurfaces();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [opacity]);

  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <MotionView
      style={[
        { height, width, borderRadius: radius, backgroundColor: colors.placeholder, marginBottom: 12 },
        animated,
        style,
      ]}
    />
  );
}

function Bone(props: SkeletonBlockProps) {
  return <SkeletonBlock {...props} style={[{ marginBottom: 0 }, props.style]} />;
}

export type SkeletonShape =
  | 'explore'
  | 'venue'
  | 'places'
  | 'capture'
  | 'offers'
  | 'owner-offers'
  | 'perks'
  | 'codes'
  | 'review'
  | 'wallet'
  | 'activity'
  | 'place-form'
  | 'perk-form'
  | 'offer-form'
  | 'setup'
  | 'profile';

export function SkeletonScreen({ label, shape = 'explore' }: { label: string; shape?: SkeletonShape }) {
  switch (shape) {
    case 'venue':
      return <VenueDetailSkeleton label={label} />;
    case 'places':
      return <PlacesSkeleton label={label} />;
    case 'capture':
      return <CaptureSkeleton label={label} />;
    case 'offers':
      return <OffersSkeleton label={label} />;
    case 'owner-offers':
      return <OwnerOffersSkeleton label={label} />;
    case 'perks':
      return <PerksSkeleton label={label} />;
    case 'codes':
      return <CodesSkeleton label={label} />;
    case 'review':
      return <ReviewSkeleton label={label} />;
    case 'wallet':
      return <WalletSkeleton label={label} />;
    case 'activity':
      return <ActivitySkeleton label={label} />;
    case 'place-form':
      return <PlaceFormSkeleton label={label} />;
    case 'perk-form':
      return <PerkFormSkeleton label={label} />;
    case 'offer-form':
      return <OfferFormSkeleton label={label} />;
    case 'setup':
      return <SetupSkeleton label={label} />;
    case 'profile':
      return <ProfileSkeleton label={label} />;
    default:
      return <ExploreSkeleton label={label} />;
  }
}

function Frame({
  label,
  tab = false,
  children,
}: {
  label: string;
  tab?: boolean;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useSurfaces();
  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      accessibilityLabel={label}
      style={{
        flex: 1,
        backgroundColor: colors.paper,
        paddingTop: insets.top + 22,
        paddingBottom: tab ? 120 : insets.bottom + 24,
      }}>
      {children}
    </Animated.View>
  );
}

function Pad({ children, gap = 22 }: { children: ReactNode; gap?: number }) {
  return <View style={{ paddingHorizontal: 20, gap }}>{children}</View>;
}

function HeaderRow({ avatar = true }: { avatar?: boolean }) {
  return (
    <View style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <Bone height={28} width={148} radius={6} />
      {avatar ? <Bone height={36} width={36} radius={18} /> : null}
    </View>
  );
}

function BackRow() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <Bone height={44} width={44} radius={22} />
      <Bone height={22} width="42%" radius={6} />
    </View>
  );
}

function StatRow() {
  const { colors } = useSurfaces();
  return (
    <View style={{ flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line }}>
      {[0, 1, 2].map((index) => (
        <View key={index} style={{ flex: 1, gap: 6, paddingVertical: 12, paddingLeft: index === 0 ? 0 : 12 }}>
          <Bone height={22} width={36} radius={4} />
          <Bone height={11} width="70%" radius={4} />
        </View>
      ))}
    </View>
  );
}

function ChipRow() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Bone height={34} width={64} radius={99} />
      <Bone height={34} width={96} radius={99} />
      <Bone height={34} width={72} radius={99} />
    </View>
  );
}

function Segment() {
  return <Bone height={40} radius={99} />;
}

function SearchBox() {
  return <Bone height={48} radius={12} />;
}

function SpotRow() {
  const { colors } = useSurfaces();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}>
      <Bone height={12} width={18} radius={3} />
      <Bone height={76} width={76} radius={8} />
      <View style={{ flex: 1, gap: 6 }}>
        <Bone height={18} width="72%" radius={4} />
        <Bone height={14} width="88%" radius={4} />
        <Bone height={12} width="46%" radius={4} />
      </View>
    </View>
  );
}

function PlaceCard() {
  const { surfaces } = useSurfaces();
  return (
    <View style={[surfaces.card, { padding: 14, paddingRight: 52, flexDirection: 'row', alignItems: 'center', gap: 14 }]}>
      <Bone height={76} width={76} radius={8} />
      <View style={{ flex: 1, gap: 8 }}>
        <Bone height={22} width="68%" radius={4} />
        <Bone height={14} width="84%" radius={4} />
        <Bone height={12} width="50%" radius={4} />
      </View>
    </View>
  );
}

function OfferTicket() {
  const { colors } = useSurfaces();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: colors.accentDeep,
        borderRadius: 10,
      }}>
      <Bone height={12} width={92} radius={4} />
      <View style={{ flex: 1, gap: 6 }}>
        <Bone height={15} width="80%" radius={4} />
        <Bone height={15} width="54%" radius={4} />
      </View>
    </View>
  );
}

function OfferCard() {
  const { surfaces, colors } = useSurfaces();
  return (
    <View style={[surfaces.card, { overflow: 'hidden' }]}>
      <View style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
        <Bone height={12} width="46%" radius={4} />
      </View>
      <Bone height={180} radius={0} />
      <View style={{ padding: 16, gap: 8 }}>
        <Bone height={26} width="70%" radius={4} />
        <Bone height={16} width="90%" radius={4} />
        <Bone height={12} width="48%" radius={4} />
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: colors.line, padding: 16 }}>
        <Bone height={12} width="40%" radius={4} />
      </View>
    </View>
  );
}

export function OfferLineSkeleton() {
  const { surfaces } = useSurfaces();
  return (
    <View style={[surfaces.card, { paddingHorizontal: 16, paddingVertical: 14, gap: 8 }]}>
      <Bone height={17} width="62%" radius={4} />
      <Bone height={14} width="84%" radius={4} />
      <Bone height={13} width="46%" radius={4} />
    </View>
  );
}

function PerkCardSkeleton() {
  const { surfaces, colors } = useSurfaces();
  return (
    <View style={surfaces.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingRight: 64 }}>
        <Bone height={64} width={64} radius={8} />
        <View style={{ flex: 1, gap: 6 }}>
          <Bone height={18} width="70%" radius={4} />
          <Bone height={14} width="52%" radius={4} />
        </View>
      </View>
      <View style={{ flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line }}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={{ flex: 1, gap: 6, paddingHorizontal: 14, paddingVertical: 12 }}>
            <Bone height={16} width={36} radius={4} />
            <Bone height={12} width="70%" radius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

export function PerkRowSkeleton() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Bone height={56} width={56} radius={8} />
      <View style={{ flex: 1, gap: 6 }}>
        <Bone height={16} width="64%" radius={4} />
        <Bone height={13} width="40%" radius={4} />
      </View>
      <Bone height={14} width={48} radius={4} />
    </View>
  );
}

export function GuestGridSkeleton() {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <Bone height={104} width={104} radius={6} />
      <Bone height={104} width={104} radius={6} />
      <Bone height={104} width={104} radius={6} />
    </View>
  );
}

function LogRow() {
  const { colors } = useSurfaces();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}>
      <Bone height={52} width={52} radius={6} />
      <View style={{ flex: 1, gap: 6 }}>
        <Bone height={16} width="58%" radius={4} />
        <Bone height={12} width="36%" radius={4} />
      </View>
      <Bone height={22} width={64} radius={99} />
    </View>
  );
}

function Field({ tall = false }: { tall?: boolean }) {
  return (
    <View style={{ gap: 8 }}>
      <Bone height={11} width={72} radius={4} />
      <Bone height={tall ? 72 : 36} radius={4} />
    </View>
  );
}

function ExploreSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad>
        <HeaderRow />
        <View style={{ gap: 8 }}>
          <Bone height={12} width="42%" radius={4} />
          <Bone height={40} width="86%" radius={6} />
          <Bone height={22} width="64%" radius={6} />
        </View>
        <SearchBox />
        <ChipRow />
        <Bone height={210} radius={12} />
        <OfferTicket />
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Bone height={26} width="58%" radius={4} />
            <Bone height={16} width={72} radius={4} />
          </View>
          <Bone height={1} radius={0} />
        </View>
        <SpotRow />
        <SpotRow />
        <SpotRow />
      </Pad>
    </Frame>
  );
}

function VenueDetailSkeleton({ label }: { label: string }) {
  const { colors } = useSurfaces();
  return (
    <Frame label={label}>
      <Bone height={280} radius={0} />
      <Pad gap={28}>
        <View style={{ gap: 8 }}>
          <Bone height={36} width="74%" radius={6} />
          <Bone height={15} width="62%" radius={4} />
          <Bone height={16} width="88%" radius={4} />
        </View>
        <View style={{ gap: 10 }}>
          <Bone height={12} width={120} radius={4} />
          <View style={{ flexDirection: 'row', gap: 0, borderWidth: 1, borderColor: colors.line, borderRadius: 12 }}>
            <View style={{ flex: 1, padding: 16, gap: 6 }}>
              <Bone height={30} width={56} radius={4} />
              <Bone height={14} width="70%" radius={4} />
            </View>
            <View style={{ flex: 1, padding: 16, gap: 6 }}>
              <Bone height={30} width={56} radius={4} />
              <Bone height={14} width="70%" radius={4} />
            </View>
          </View>
        </View>
        <View style={{ gap: 10 }}>
          <Bone height={24} width={120} radius={4} />
          <PerkRowSkeleton />
        </View>
        <View style={{ gap: 8 }}>
          <Bone height={24} width={80} radius={4} />
          <OfferLineSkeleton />
        </View>
      </Pad>
    </Frame>
  );
}

function PlacesSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad>
        <HeaderRow />
        <Bone height={36} width="52%" radius={6} />
        <StatRow />
        <PlaceCard />
        <PlaceCard />
      </Pad>
    </Frame>
  );
}

function CaptureSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad>
        <HeaderRow avatar={false} />
        <View style={{ gap: 12 }}>
          <Bone height={22} width="46%" radius={4} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Bone height={72} width={160} radius={12} />
            <Bone height={72} width={160} radius={12} />
          </View>
        </View>
        <View style={{ gap: 12 }}>
          <Bone height={22} width="48%" radius={4} />
          <Bone height={180} radius={16} />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Bone height={72} style={{ flex: 1 }} radius={12} />
            <Bone height={72} style={{ flex: 1 }} radius={12} />
          </View>
        </View>
      </Pad>
    </Frame>
  );
}

function OffersSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad gap={28}>
        <View style={{ gap: 10 }}>
          <HeaderRow />
          <Bone height={16} width="72%" radius={4} />
        </View>
        <OfferCard />
      </Pad>
    </Frame>
  );
}

function OwnerOffersSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad>
        <Bone height={28} width={110} radius={6} />
        <Bone height={16} width="80%" radius={4} />
        <OfferCard />
        <Bone height={56} radius={12} />
      </Pad>
    </Frame>
  );
}

function PerksSkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad>
        <Bone height={28} width={100} radius={6} />
        <Bone height={16} width="70%" radius={4} />
        <PerkCardSkeleton />
        <PerkCardSkeleton />
      </Pad>
    </Frame>
  );
}

function CodesSkeleton({ label }: { label: string }) {
  const { surfaces } = useSurfaces();
  return (
    <Frame label={label} tab>
      <Pad>
        <Bone height={28} width={100} radius={6} />
        <Bone height={16} width="78%" radius={4} />
        <SearchBox />
        <Segment />
        <View style={[surfaces.card, { padding: 16, gap: 10 }]}>
          <Bone height={18} width="46%" radius={4} />
          <Bone height={14} width="64%" radius={4} />
          <Bone height={32} width={120} radius={8} />
        </View>
      </Pad>
    </Frame>
  );
}

function ReviewSkeleton({ label }: { label: string }) {
  const { surfaces } = useSurfaces();
  return (
    <Frame label={label} tab>
      <Pad>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Bone height={28} width={110} radius={6} />
          <Bone height={34} width={120} radius={99} />
        </View>
        <Bone height={16} width="86%" radius={4} />
        <Segment />
        <View style={[surfaces.card, { overflow: 'hidden' }]}>
          <Bone height={220} radius={0} />
          <View style={{ padding: 14, gap: 8 }}>
            <Bone height={16} width="48%" radius={4} />
            <Bone height={14} width="32%" radius={4} />
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Bone height={40} style={{ flex: 1 }} radius={10} />
              <Bone height={40} style={{ flex: 1 }} radius={10} />
            </View>
          </View>
        </View>
      </Pad>
    </Frame>
  );
}

function WalletSkeleton({ label }: { label: string }) {
  const { surfaces } = useSurfaces();
  return (
    <Frame label={label} tab>
      <Pad>
        <HeaderRow />
        <View style={[surfaces.card, { padding: 20, flexDirection: 'row', justifyContent: 'space-between' }]}>
          <View style={{ gap: 8 }}>
            <Bone height={12} width={110} radius={4} />
            <Bone height={64} width={96} radius={8} />
          </View>
          <View style={{ gap: 8, alignItems: 'flex-end' }}>
            <Bone height={12} width={72} radius={4} />
            <Bone height={12} width={56} radius={4} />
            <Bone height={12} width={64} radius={4} />
          </View>
        </View>
        <Bone height={12} width={72} radius={4} />
        <Bone height={72} radius={12} />
        <Bone height={72} radius={12} />
      </Pad>
    </Frame>
  );
}

function ActivitySkeleton({ label }: { label: string }) {
  return (
    <Frame label={label} tab>
      <Pad gap={18}>
        <HeaderRow />
        <StatRow />
        <Segment />
        <Bone height={12} width={140} radius={4} />
        <LogRow />
        <LogRow />
        <LogRow />
      </Pad>
    </Frame>
  );
}

function PlaceFormSkeleton({ label }: { label: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useSurfaces();
  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      accessibilityLabel={label}
      style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 18 }}>
      <View style={{ paddingHorizontal: 20, gap: 30 }}>
        <BackRow />
        <Bone height={220} radius={10} />
        <Field tall />
        <ChipRow />
        <Field />
        <Bone height={180} radius={12} />
      </View>
    </Animated.View>
  );
}

function PerkFormSkeleton({ label }: { label: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useSurfaces();
  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      accessibilityLabel={label}
      style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 18 }}>
      <View style={{ paddingHorizontal: 20, gap: 24 }}>
        <BackRow />
        <Bone height={160} radius={10} />
        <Field />
        <Field />
        <ChipRow />
        <Field />
      </View>
    </Animated.View>
  );
}

function OfferFormSkeleton({ label }: { label: string }) {
  return <PerkFormSkeleton label={label} />;
}

function SetupSkeleton({ label }: { label: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useSurfaces();
  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      accessibilityLabel={label}
      style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 28, paddingHorizontal: 20, gap: 18 }}>
      <Bone height={12} width={80} radius={4} />
      <Bone height={40} width="70%" radius={6} />
      <Bone height={16} width="88%" radius={4} />
      <Bone height={16} width="64%" radius={4} />
      <Bone height={52} radius={12} style={{ marginTop: 12 }} />
    </Animated.View>
  );
}

function ProfileSkeleton({ label }: { label: string }) {
  const insets = useSafeAreaInsets();
  const { colors } = useSurfaces();
  return (
    <Animated.View
      entering={FadeIn.duration(320)}
      accessibilityLabel={label}
      style={{ flex: 1, backgroundColor: colors.paper, paddingTop: insets.top + 18, paddingHorizontal: 20, gap: 28 }}>
      <BackRow />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Bone height={84} width={84} radius={42} />
        <View style={{ flex: 1, gap: 8 }}>
          <Bone height={22} width="54%" radius={4} />
          <Bone height={14} width="36%" radius={4} />
        </View>
      </View>
      <Field />
      <Field />
      <Bone height={1} radius={0} />
      <Field />
      <Field />
      <Bone height={1} radius={0} />
      <Bone height={72} radius={12} />
    </Animated.View>
  );
}
