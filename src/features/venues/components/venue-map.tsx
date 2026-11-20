import type { VenueMapProps } from '@/features/venues/components/map-chrome';
import { SketchMap } from '@/features/venues/components/sketch-map';
import { useEffect, useState, type ComponentType } from 'react';

/** Leaflet touches `window`, so the live map loads after the static page is in the browser. */
export function VenueMap(props: VenueMapProps) {
  const [LiveMap, setLiveMap] = useState<ComponentType<VenueMapProps> | null>(null);

  useEffect(() => {
    let active = true;
    void import('@/features/venues/components/venue-map-leaflet')
      .then((module) => {
        if (active) setLiveMap(() => module.VenueMapLeaflet);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (!LiveMap) {
    const featured = props.venues.find((venue) => venue.offerPercent != null) ?? props.venues[0];
    const other = props.venues.find((venue) => venue.id !== featured?.id);
    const label = (venue?: (typeof props.venues)[number]) =>
      venue ? (venue.offerPercent != null ? `${venue.offerPercent}% ${venue.name}` : venue.name) : undefined;
    return <SketchMap height={props.height ?? 210} primary={label(featured)} secondary={label(other)} />;
  }

  return <LiveMap {...props} />;
}
