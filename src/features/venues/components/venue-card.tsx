import { PressScale } from '@/components/ui/press-scale';
import { Body, Mono, Pts } from '@/components/ui/typography';
import { ShopImage } from '@/features/venues/components/shop-image';
import { formatDistance, type Venue } from '@/features/venues/schemas';
import { useSurfaces } from '@/theme/surfaces';
import { View } from 'react-native';

type VenueCardProps = {
  venue: Venue;
  index: number;
  onPress: () => void;
};

/** Numbered journal row: index, photo, name, address and what a visit earns. */
export function VenueCard({ venue, index, onPress }: VenueCardProps) {
  const { colors } = useSurfaces();
  const distance = venue.distance !== undefined ? formatDistance(venue.distance) : null;
  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={`${venue.name}, ${venue.address}${distance ? `, ${distance} away` : ''}`}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.line,
      }}>
      <Mono size={12} color={colors.faint} style={{ width: 18 }}>
        {String(index + 1).padStart(2, '0')}
      </Mono>
      <ShopImage uri={venue.imageUrl} label={venue.category || venue.name} />
      <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
        <Body size={18} weight="bold" numberOfLines={1}>
          {venue.name}
        </Body>
        <Body size={14} color={colors.mute} numberOfLines={1}>
          {distance ? `${distance} · ${venue.address}` : venue.address}
        </Body>
        <Pts>{`+${venue.pointsPerPhoto} photo · +${venue.pointsPerVideo} video`}</Pts>
      </View>
    </PressScale>
  );
}
