import { queryKeys } from '@/api/keys';
import {
  fetchApprovedMedia,
  fetchNearbyVenues,
  fetchPromotionFeed,
  fetchRedeemed,
  fetchRedeemedShots,
  fetchVenuePerks,
  fetchVenuePromotions,
  fetchVenues,
} from '@/features/venues/api';
import { distanceMeters, type Venue } from '@/features/venues/schemas';
import * as Location from 'expo-location';
import { useMemo } from 'react';
import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

async function readGrantedLocation() {
  const permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted) return null;
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return { lat: position.coords.latitude, lng: position.coords.longitude };
}

export function useUserLocation() {
  return useQuery({
    queryKey: queryKeys.location,
    retry: false,
    staleTime: 60_000,
    queryFn: async () => {
      try {
        return await Promise.race([
          readGrantedLocation(),
          new Promise<null>((resolve) => {
            setTimeout(() => resolve(null), 4000);
          }),
        ]);
      } catch {
        return null;
      }
    },
  });
}

/** City name for the header label; `null` when location is off or the lookup fails. */
export function useCityName(coords?: { lat: number; lng: number } | null) {
  const lat = coords ? Math.round(coords.lat * 100) / 100 : 0;
  const lng = coords ? Math.round(coords.lng * 100) / 100 : 0;
  return useQuery({
    queryKey: queryKeys.city(lat, lng),
    enabled: Boolean(coords) && Platform.OS !== 'web',
    staleTime: Infinity,
    retry: false,
    queryFn: async () => {
      try {
        const [place] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
        return place?.city || place?.subregion || place?.region || null;
      } catch {
        return null;
      }
    },
  });
}

export function useNearbyVenues(lat?: number, lng?: number) {
  return useQuery({
    queryKey: queryKeys.venuesNear(lat ?? 0, lng ?? 0),
    queryFn: () => fetchNearbyVenues(lat ?? 0, lng ?? 0),
    enabled: lat !== undefined && lng !== undefined,
  });
}

export function useAllVenues(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.venues,
    queryFn: fetchVenues,
    enabled,
  });
}

/** Every published place. Location only sorts the nearer shops first. */
export function useExploreVenues() {
  const client = useQueryClient();
  const location = useUserLocation();
  const coords = location.data;
  const all = useAllVenues(true);

  const venues = useMemo(() => {
    const rows = all.data ?? [];
    if (!coords) return rows;
    return rows
      .map((venue) => ({ ...venue, distance: distanceMeters(coords, venue) }))
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }, [all.data, coords]);

  const refetch = async () => {
    await location.refetch();
    await all.refetch();
  };

  return {
    venues,
    isPending: all.isPending,
    isRefetching: all.isRefetching || location.isRefetching,
    isError: all.isError,
    refetch,
    locationOff: location.isFetched && !coords,
    enableLocation: async () => {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) return;
      await client.invalidateQueries({ queryKey: queryKeys.location });
    },
  };
}

export function useVenue(venueId: string | null) {
  const venues = useAllVenues(Boolean(venueId));
  const client = useQueryClient();
  const cached = venueId
    ? client
        .getQueriesData<Venue[]>({ queryKey: ['venues'] })
        .flatMap(([, data]) => data ?? [])
        .find((item) => item.id === venueId)
    : undefined;

  return {
    ...venues,
    venue: venueId ? (venues.data?.find((item) => item.id === venueId) ?? cached ?? null) : null,
    isPending: Boolean(venueId) && venues.isPending && !cached,
    isError: Boolean(venueId) && venues.isError && !cached,
  };
}

export function useVenuePerks(venueId: string | null) {
  return useQuery({
    queryKey: queryKeys.venuePerks(venueId ?? ''),
    queryFn: () => fetchVenuePerks(venueId ?? ''),
    enabled: Boolean(venueId),
  });
}

export function usePromotionFeed() {
  return useQuery({ queryKey: queryKeys.promotionFeed, queryFn: fetchPromotionFeed });
}

export function useVenuePromotions(venueId: string | null) {
  return useQuery({
    queryKey: queryKeys.venuePromotions(venueId ?? ''),
    queryFn: () => fetchVenuePromotions(venueId ?? ''),
    enabled: Boolean(venueId),
  });
}

export function useRedeemed(venueId: string | null) {
  return useQuery({
    queryKey: queryKeys.redeemed(venueId ?? ''),
    queryFn: () => fetchRedeemed(venueId ?? ''),
    enabled: Boolean(venueId),
  });
}

export function useRedeemedShots(venueId: string, filter: string) {
  return useInfiniteQuery({
    queryKey: queryKeys.redeemedShots(venueId, filter),
    queryFn: ({ pageParam }) => fetchRedeemedShots(venueId, filter, pageParam || undefined),
    initialPageParam: '',
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: Boolean(venueId),
  });
}

export function useVenueGallery(venueId: string) {
  return useQuery({
    queryKey: queryKeys.venueGallery(venueId),
    queryFn: () => fetchApprovedMedia(venueId),
    enabled: Boolean(venueId),
  });
}
