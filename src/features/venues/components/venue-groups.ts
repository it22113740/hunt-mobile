import type { Venue } from '@/features/venues/schemas';

/** City view: every bubble is a count, including a lone venue. */
export const CITY_ZOOM = 11.5;

/** Past this, a venue with room around it shows its name and offer. Packed spots stay a count. */
export const DETAIL_ZOOM = 13.5;

/** Close enough that every restaurant in view shows its name, even on a busy street. */
export const NAME_ZOOM = 16.5;

export type VenueCluster = {
  kind: 'cluster';
  id: string;
  lat: number;
  lng: number;
  count: number;
  hasOffer: boolean;
};

export type VenuePin = {
  kind: 'pin';
  venue: Venue;
  /** 0 sits on the building. Higher values lift the label so names in one building stay readable. */
  stack: number;
};

export type VenueGroup = VenueCluster | VenuePin;

const METERS_PER_PIXEL_AT_ZOOM_0 = 156543.03392;

export function mapCenter(venues: Venue[], latitude?: number, longitude?: number): [number, number] {
  if (latitude !== undefined && longitude !== undefined) return [longitude, latitude];
  const venue = venues.find((item) => Number.isFinite(item.lng) && Number.isFinite(item.lat));
  if (venue) return [venue.lng, venue.lat];
  return [79.8612, 6.9271];
}

/** West, south, east, north. `pad` grows the box so markers on the edge stay visible. */
export function venuesInBounds(
  venues: Venue[],
  bounds: [number, number, number, number] | null,
  pad = 0,
): Venue[] {
  if (!bounds) return venues;
  const [west, south, east, north] = bounds;
  if (![west, south, east, north].every(Number.isFinite) || east < west || north < south) return venues;
  const latPad = (north - south) * pad;
  const lngPad = (east - west) * pad;
  return venues.filter(
    (venue) =>
      venue.lng >= west - lngPad &&
      venue.lng <= east + lngPad &&
      venue.lat >= south - latPad &&
      venue.lat <= north + latPad,
  );
}

function asPins(venues: Venue[]): VenuePin[] {
  const seen = new Map<string, number>();
  return [...venues]
    .sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
    .map((venue) => {
      const key = `${venue.lat.toFixed(5)}:${venue.lng.toFixed(5)}`;
      const stack = seen.get(key) ?? 0;
      seen.set(key, stack + 1);
      return { kind: 'pin', venue, stack };
    });
}

export function groupVenues(venues: Venue[], zoom: number): VenueGroup[] {
  if (venues.length === 0) return [];
  if (zoom >= NAME_ZOOM) return asPins(venues);

  const refLat = venues.reduce((sum, venue) => sum + venue.lat, 0) / venues.length;
  const cellMeters = 58 * (METERS_PER_PIXEL_AT_ZOOM_0 / 2 ** zoom);
  const latCell = cellMeters / 111320;
  const lngCell = cellMeters / (111320 * Math.max(0.2, Math.cos((refLat * Math.PI) / 180)));
  const buckets = new Map<string, Venue[]>();

  for (const venue of venues) {
    const key = `${Math.floor(venue.lat / latCell)}:${Math.floor(venue.lng / lngCell)}`;
    const list = buckets.get(key);
    if (list) list.push(venue);
    else buckets.set(key, [venue]);
  }

  const groups: VenueGroup[] = [];
  for (const [key, members] of buckets) {
    const [only] = members;
    if (only && members.length === 1 && zoom >= DETAIL_ZOOM) {
      groups.push({ kind: 'pin', venue: only, stack: 0 });
      continue;
    }
    const lat = members.reduce((sum, venue) => sum + venue.lat, 0) / members.length;
    const lng = members.reduce((sum, venue) => sum + venue.lng, 0) / members.length;
    groups.push({
      kind: 'cluster',
      id: key.replace(':', 'x'),
      lat,
      lng,
      count: members.length,
      hasOffer: members.some((venue) => (venue.offerPercent ?? 0) > 0),
    });
  }
  return groups;
}

export function clusterDiameter(count: number) {
  if (count >= 400) return 62;
  if (count >= 100) return 52;
  if (count >= 30) return 44;
  if (count >= 10) return 38;
  return 32;
}

export function formatClusterCount(count: number) {
  if (count < 1000) return String(count);
  const compact = Math.round(count / 100) / 10;
  return `${compact}k`.replace('.0k', 'k');
}

/** Small groups open straight to names. Big groups step in so the counts can split. */
export function zoomForCluster(currentZoom: number, count: number) {
  const stepped = Math.min(currentZoom + 1.8, NAME_ZOOM);
  if (stepped <= currentZoom) return Math.min(currentZoom + 1, 18);
  if (count <= 8 && currentZoom < DETAIL_ZOOM) return Math.max(stepped, DETAIL_ZOOM);
  return stepped;
}

export function venueCountLabel(count: number) {
  const shown = count >= 1000 ? '1000+' : String(count);
  const noun = count === 1 ? 'venue' : 'venues';
  return `${shown} active ${noun} in this area`;
}

export function pinLabel(venue: Venue) {
  return venue.offerPercent != null ? `${venue.name}, ${venue.offerPercent}% off` : venue.name;
}
