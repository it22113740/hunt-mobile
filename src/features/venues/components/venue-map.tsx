import { SketchMap } from '@/features/venues/components/sketch-map';
import type { Venue } from '@/features/venues/schemas';

type VenueMapProps = {
  venues: Venue[];
  latitude?: number;
  longitude?: number;
  onSelect: (venueId: string) => void;
  height?: number;
};

function sketchName(venue?: Venue) {
  if (!venue) return undefined;
  return venue.offerPercent != null ? `${venue.offerPercent}% ${venue.name}` : venue.name;
}

export function VenueMap({ venues, height = 210 }: VenueMapProps) {
  const featured = venues.find((venue) => venue.offerPercent != null) ?? venues[0];
  const other = venues.find((venue) => venue.id !== featured?.id);
  return <SketchMap height={height} primary={sketchName(featured)} secondary={sketchName(other)} />;
}
