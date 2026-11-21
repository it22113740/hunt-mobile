import { useListRefresh } from '@/components/list-refresh';
import { ScreenState } from '@/components/screen-state';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Doodle } from '@/components/ui/decor';
import { ScreenEnter } from '@/components/ui/enter';
import { BackHeader } from '@/components/ui/screen-header';
import { MediaViewer } from '@/components/ui/media-viewer';
import { ScribbleUnderline, Sub } from '@/components/ui/typography';
import { PerkShotCard } from '@/features/venues/components/perk-shot-card';
import { formatCount } from '@/features/perk-hunters/format';
import { useRedeemed, useRedeemedShots } from '@/features/venues/hooks';
import type { PerkShot } from '@/features/venues/schemas';
import { useSurfaces } from '@/theme/surfaces';
import { useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type RedeemedScreenProps = {
  venueId: string;
};

export function RedeemedScreen({ venueId }: RedeemedScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors } = useSurfaces();
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState<PerkShot | null>(null);
  const board = useRedeemed(venueId);
  const shots = useRedeemedShots(venueId, filter);
  const refreshControl = useListRefresh([board, shots]);
  const gap = 12;
  const card = Math.floor((Math.min(width, 560) - 40 - gap) / 2);
  const items = shots.data?.pages.flatMap((page) => page.items) ?? [];

  if (board.isPending) return <ScreenState loading skeleton="venue" title="Loading redeemed perks" />;
  if (board.isError || !board.data) {
    return (
      <ScreenState
        title="Couldn’t open this list"
        detail="Check your connection and try again."
        action="Try again"
        onPress={() => void board.refetch()}
      />
    );
  }

  const data = board.data;
  const guests = data.people === 1 ? 'guest' : 'guests';

  return (
    <ScreenEnter className="flex-1 bg-hunt-paper" style={{ paddingTop: insets.top }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: insets.bottom + 28, gap: 16 }}
        refreshControl={refreshControl}>
        <BackHeader label={`${data.venueName} · Redeemed`} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 32, lineHeight: 36, color: colors.ink }}>
            {`${formatCount(data.people)} ${guests} swapped a `}
          </Text>
          <ScribbleUnderline>
            <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 32, lineHeight: 36, color: colors.ink }}>perk</Text>
          </ScribbleUnderline>
          <Text style={{ fontFamily: 'BricolageGrotesque_800ExtraBold', fontSize: 32, lineHeight: 36, color: colors.ink }}> here.</Text>
          <Doodle kind="sparkle" size={18} accent style={{ position: 'relative', marginLeft: 4, marginBottom: 6 }} />
        </View>
        <Text style={{ fontFamily: 'IBMPlexMono_500Medium', fontSize: 12, letterSpacing: 0.6, color: colors.mute }}>
          {`${formatCount(data.perks)} PERKS  ·  ${formatCount(data.shots)} SHOTS  ·  ${formatCount(data.regulars)} REGULARS`}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="All" selected={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="This month" selected={filter === 'month'} onPress={() => setFilter('month')} />
          {data.filters.map((perk) => (
            <Chip
              key={perk.id}
              label={perk.title}
              selected={filter === `perk:${perk.id}`}
              onPress={() => setFilter(`perk:${perk.id}`)}
            />
          ))}
        </ScrollView>
        {shots.isPending ? <Sub>Loading photos…</Sub> : null}
        {shots.isError ? (
          <Sub>Couldn’t load these photos.</Sub>
        ) : items.length === 0 ? (
          <Sub>No photos for this yet. They show up when a guest snaps the perk they redeemed.</Sub>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
            {items.map((shot) => (
              <PerkShotCard key={shot.id} shot={shot} width={card} detailed onPress={() => setOpen(shot)} />
            ))}
          </View>
        )}
        {shots.hasNextPage ? (
          <Button label="Load more" variant="secondary" loading={shots.isFetchingNextPage} onPress={() => void shots.fetchNextPage()} />
        ) : null}
        <Sub size={13}>Photos are taken at the counter when a perk is swapped, only with the guest’s OK.</Sub>
      </ScrollView>
      <MediaViewer url={open?.mediaUrl ?? null} kind={open ? 'PHOTO' : null} onClose={() => setOpen(null)} />
    </ScreenEnter>
  );
}
