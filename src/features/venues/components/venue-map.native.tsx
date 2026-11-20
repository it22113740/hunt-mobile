import type { VenueMapProps } from '@/features/venues/components/map-chrome';
import { SketchMap } from '@/features/venues/components/sketch-map';
import type { Venue } from '@/features/venues/schemas';
import { isExpoGo } from '@/lib/expo-go';
import { useHuntColors } from '@/theme/colors';
import { lazy, Suspense } from 'react';
import { View } from 'react-native';

function sketchName(venue?: Venue) {
  if (!venue) return undefined;
  return venue.offerPercent != null ? `${venue.offerPercent}% ${venue.name}` : venue.name;
}

function MapPreview({ venues, height = 210 }: VenueMapProps) {
  const featured = venues.find((venue) => venue.offerPercent != null) ?? venues[0];
  const other = venues.find((venue) => venue.id !== featured?.id);
  return <SketchMap height={height} primary={sketchName(featured)} secondary={sketchName(other)} />;
}

// Loaded lazily: MapLibre's native module is missing from Expo Go and throws on import.
const VenueMapLibre = lazy(() =>
  import('@/features/venues/components/venue-map-libre')
    .then((module) => ({ default: module.VenueMapLibre }))
    .catch(() => ({ default: MapPreview })),
);

export function VenueMap(props: VenueMapProps) {
  const colors = useHuntColors();
  const height = props.height ?? 210;

  if (isExpoGo) {
    return <MapPreview {...props} height={height} />;
  }
  return (
    <Suspense fallback={<View style={{ height, backgroundColor: colors.mapBg }} />}>
      <VenueMapLibre {...props} />
    </Suspense>
  );
}
