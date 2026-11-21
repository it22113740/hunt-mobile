import { EmptyState } from '@/components/empty-state';
import { useListRefresh } from '@/components/list-refresh';
import { SkeletonBlock } from '@/components/skeleton';
import { Doodle, Ticks } from '@/components/ui/decor';
import { ScreenEnter } from '@/components/ui/enter';
import { BackHeader } from '@/components/ui/screen-header';
import { Body, Hand, Label, MarkedHeading, Sub } from '@/components/ui/typography';
import { formatCount } from '@/features/perk-hunters/format';
import { usePerkHunterSummary } from '@/features/perk-hunters/hooks';
import { levelIcon } from '@/features/perk-hunters/level-icons';
import type { HuntLevel } from '@/features/perk-hunters/schemas';
import { useSurfaces } from '@/theme/surfaces';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function LevelsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, surfaces, isWhite } = useSurfaces();
  const summary = usePerkHunterSummary();
  const refreshControl = useListRefresh([summary]);

  if (summary.isPending) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top, paddingHorizontal: 20 }}>
        <SkeletonBlock height={24} width={120} />
        <SkeletonBlock height={64} />
        <SkeletonBlock height={88} />
        <SkeletonBlock height={320} />
      </ScreenEnter>
    );
  }

  if (summary.isError || !summary.data) {
    return (
      <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 18 }}>
          <BackHeader label="Levels" />
          <EmptyState
            title="Couldn’t load levels"
            detail="Check your connection and try again."
            action="Try again"
            onPress={() => void summary.refetch()}
          />
        </View>
      </ScreenEnter>
    );
  }

  const data = summary.data;

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <ScrollView
        refreshControl={refreshControl}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: insets.bottom + 32, gap: 16 }}>
        {isWhite ? <Doodle kind="sparkle" size={18} accent style={{ right: 16, top: 78 }} /> : null}
        <BackHeader label="Levels" />
        <Label>12 levels · lifetime perks</Label>
        <MarkedHeading before="From Explorer to " mark="Hunt Master" after="." size={32} />
        <Sub>Each perk you redeem moves you up. The line on a level is what that stretch is for.</Sub>
        <View style={[surfaces.soft, { backgroundColor: colors.blush, padding: 16, gap: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Label color={colors.accentDeep}>{`Level ${data.level.number} of 12`}</Label>
            <Label>
              {data.next
                ? `${formatCount(data.lifetimeRedemptions)} / ${formatCount(data.next.minRedemptions)}`
                : formatCount(data.lifetimeRedemptions)}
            </Label>
          </View>
          <Ticks progress={data.progress} />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
            <Body size={13} weight="bold">
              {data.level.name}
            </Body>
            <Sub size={13}>
              {data.next ? `${data.next.name} in ${formatCount(data.toGo)}` : 'Top level reached'}
            </Sub>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          {data.levels.map((level) => (
            <LevelRow
              key={level.number}
              level={level}
              state={
                level.number < data.level.number ? 'done' : level.number === data.level.number ? 'current' : 'locked'
              }
            />
          ))}
        </View>
        <Hand size={22} style={{ textAlign: 'center', marginTop: 4 }}>
          Hunt Masters get a gift every year.
        </Hand>
      </ScrollView>
    </ScreenEnter>
  );
}

function LevelRow({ level, state }: { level: HuntLevel; state: 'done' | 'current' | 'locked' }) {
  const { colors, surfaces } = useSurfaces();
  const Icon = levelIcon(level.number);
  const current = state === 'current';
  const done = state === 'done';
  return (
    <View
      accessible
      accessibilityLabel={`Level ${level.number}, ${level.name}, ${done ? 'done' : current ? 'your level' : `${formatCount(level.minRedemptions)} perks`}. ${level.unlocks}`}
      style={[
        surfaces.soft,
        current ? { backgroundColor: colors.blush, borderColor: colors.accent, borderWidth: 1.5 } : null,
        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12 },
      ]}>
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: done ? colors.accent : current ? colors.card : colors.placeholder,
          borderWidth: done ? 0 : 1.5,
          borderStyle: done ? 'solid' : 'dashed',
          borderColor: current ? colors.accent : colors.lineStrong,
        }}>
        <Icon color={done ? colors.onAccent : current ? colors.accentDeep : colors.faint} size={20} strokeWidth={1.8} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
          <Label>{String(level.number).padStart(2, '0')}</Label>
          <Body size={16} weight="bold">
            {level.name}
          </Body>
        </View>
        <Sub size={13}>{level.unlocks}</Sub>
      </View>
      {current ? (
        <View style={{ backgroundColor: colors.ink, borderRadius: 4, paddingVertical: 3, paddingHorizontal: 6 }}>
          <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 11, letterSpacing: 0.7, color: colors.card }}>
            YOU
          </Text>
        </View>
      ) : (
        <Label>{done ? 'Done' : formatCount(level.minRedemptions)}</Label>
      )}
    </View>
  );
}
