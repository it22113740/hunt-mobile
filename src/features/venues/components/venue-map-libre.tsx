import { MapChrome, useMapExpansion, type MapSeed, type VenueMapProps } from '@/features/venues/components/map-chrome';
import { sketchMapStyle } from '@/features/venues/components/map-style';
import {
  CITY_ZOOM,
  DETAIL_ZOOM,
  clusterDiameter,
  formatClusterCount,
  groupVenues,
  mapCenter,
  pinLabel,
  venueCountLabel,
  venuesInBounds,
  zoomForCluster,
  type VenueCluster,
  type VenuePin,
} from '@/features/venues/components/venue-groups';
import { distanceMeters, type Venue } from '@/features/venues/schemas';
import { useHuntColors, type HuntColors } from '@/theme/colors';
import {
  Camera,
  GeoJSONSource,
  Layer,
  Map,
  Marker,
  type CameraRef,
  type MapRef,
  type ViewState,
} from '@maplibre/maplibre-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Text, View } from 'react-native';

export function VenueMapLibre({ onSelect, onVisibleCount, ...props }: VenueMapProps) {
  const expansion = useMapExpansion();

  const select = (venueId: string) => {
    if (expansion.expanded) expansion.collapse();
    onSelect(venueId);
  };

  return (
    <>
      <MapCanvas
        key={expansion.cardKey}
        {...props}
        seed={expansion.cardSeed}
        onSelect={select}
        onVisibleCount={expansion.expanded ? undefined : onVisibleCount}
        onExpand={expansion.expand}
        onView={expansion.remember}
      />
      <Modal
        visible={expansion.expanded}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={expansion.collapse}>
        {expansion.expanded ? (
          <MapCanvas
            {...props}
            expanded
            seed={expansion.fullSeed}
            onSelect={select}
            onVisibleCount={onVisibleCount}
            onClose={expansion.collapse}
            onView={expansion.remember}
          />
        ) : null}
      </Modal>
    </>
  );
}

function MapCanvas({
  venues,
  latitude,
  longitude,
  onSelect,
  onVisibleCount,
  height = 210,
  expanded = false,
  seed,
  onExpand,
  onClose,
  onView,
}: VenueMapProps & {
  expanded?: boolean;
  seed: MapSeed | null;
  onExpand?: () => void;
  onClose?: () => void;
  onView?: (seed: MapSeed) => void;
}) {
  const colors = useHuntColors();
  const mapStyle = useMemo(() => sketchMapStyle(colors), [colors]);
  const mapRef = useRef<MapRef>(null);
  const cameraRef = useRef<CameraRef>(null);
  const [zoom, setZoom] = useState(seed?.zoom ?? CITY_ZOOM);
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);
  const center = seed?.center ?? mapCenter(venues, latitude, longitude);
  const user = latitude !== undefined && longitude !== undefined ? { lat: latitude, lng: longitude } : null;
  const nearest = user
    ? venues.reduce<Venue | undefined>(
        (best, venue) => (!best || distanceMeters(user, venue) < distanceMeters(user, best) ? venue : best),
        undefined,
      )
    : undefined;

  const visible = useMemo(() => venuesInBounds(venues, bounds, 0.45), [bounds, venues]);
  const groups = useMemo(() => groupVenues(visible, zoom), [visible, zoom]);
  const areaCount = bounds ? venuesInBounds(venues, bounds).length : venues.length;

  useEffect(() => {
    if (!bounds) return;
    onVisibleCount?.(areaCount);
  }, [areaCount, bounds, onVisibleCount]);

  const applyView = (state: ViewState) => {
    setZoom(state.zoom);
    setBounds(state.bounds);
    onView?.({ center: state.center, zoom: state.zoom });
  };

  const openCluster = (cluster: VenueCluster) => {
    const nextZoom = zoomForCluster(zoom, cluster.count);
    cameraRef.current?.easeTo({
      center: [cluster.lng, cluster.lat],
      zoom: nextZoom,
      duration: 450,
    });
  };

  return (
    <MapChrome
      height={height}
      expanded={expanded}
      caption={venueCountLabel(areaCount)}
      onExpand={onExpand}
      onClose={onClose}>
      <Map
        ref={mapRef}
        style={{ flex: 1 }}
        mapStyle={mapStyle}
        androidView="texture"
        logo={false}
        compass={false}
        attributionPosition={{ bottom: expanded ? 96 : 6, right: 6 }}
        touchRotate={false}
        touchPitch={false}
        accessibilityLabel="Venue map"
        onDidFinishLoadingMap={() => {
          void mapRef.current?.getViewState().then((state) => {
            if (state) applyView(state);
          });
        }}
        onRegionDidChange={(event) => {
          applyView(event.nativeEvent);
        }}>
        <Camera ref={cameraRef} initialViewState={{ center, zoom: seed?.zoom ?? CITY_ZOOM }} />
        {zoom >= DETAIL_ZOOM && user && nearest ? (
          <GeoJSONSource
            id="route-to-nearest"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: [
                  [user.lng, user.lat],
                  [nearest.lng, nearest.lat],
                ],
              },
            }}>
            <Layer
              id="route-to-nearest-line"
              type="line"
              paint={{ 'line-color': colors.ink, 'line-width': 1.4, 'line-dasharray': [2, 3] }}
            />
          </GeoJSONSource>
        ) : null}
        {user ? (
          <Marker id="you" lngLat={[user.lng, user.lat]} anchor="center" accessibilityLabel="You are here">
            <View
              collapsable={false}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: colors.card,
                borderWidth: 1.6,
                borderColor: colors.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.ink }} />
            </View>
          </Marker>
        ) : null}
        {groups.map((group) =>
          group.kind === 'cluster' ? (
            <ClusterMarker key={`cluster-${group.id}`} cluster={group} colors={colors} onPress={() => openCluster(group)} />
          ) : (
            <PinMarker key={group.venue.id} pin={group} colors={colors} onPress={() => onSelect(group.venue.id)} />
          ),
        )}
      </Map>
    </MapChrome>
  );
}

function ClusterMarker({
  cluster,
  colors,
  onPress,
}: {
  cluster: VenueCluster;
  colors: HuntColors;
  onPress: () => void;
}) {
  const size = clusterDiameter(cluster.count);
  const label = formatClusterCount(cluster.count);
  return (
    <Marker
      id={`cluster-${cluster.id}`}
      lngLat={[cluster.lng, cluster.lat]}
      anchor="center"
      onPress={onPress}
      accessibilityLabel={`${label} ${cluster.count === 1 ? 'venue' : 'venues'}. Zooms in.`}>
      <View
        collapsable={false}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.card,
          borderWidth: cluster.hasOffer ? 2.5 : 1.5,
          borderColor: cluster.hasOffer ? colors.accent : colors.ink,
          boxShadow: cluster.hasOffer ? '0 0 0 6px rgba(252,100,1,0.28)' : '0px 1px 4px rgba(24,24,26,0.18)',
        }}>
        <Text
          style={{
            fontFamily: 'BricolageGrotesque_700Bold',
            fontSize: size >= 52 ? 16 : 14,
            color: colors.ink,
          }}>
          {label}
        </Text>
      </View>
    </Marker>
  );
}

function PinMarker({ pin, colors, onPress }: { pin: VenuePin; colors: HuntColors; onPress: () => void }) {
  const venue = pin.venue;
  return (
    <Marker
      id={`venue-${venue.id}`}
      lngLat={[venue.lng, venue.lat]}
      anchor="bottom"
      onPress={onPress}
      accessibilityLabel={pinLabel(venue)}>
      <View collapsable={false} style={{ alignItems: 'center', maxWidth: 188 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            maxWidth: 188,
            borderRadius: 9,
            paddingHorizontal: 8,
            paddingVertical: 5,
            backgroundColor: colors.card,
            borderWidth: 1.5,
            borderColor: colors.ink,
            boxShadow: '0px 2px 6px rgba(24,24,26,0.16)',
          }}>
          <Text
            numberOfLines={1}
            style={{
              flexShrink: 1,
              maxWidth: 124,
              fontFamily: 'BricolageGrotesque_600SemiBold',
              fontSize: 13,
              color: colors.ink,
            }}>
            {venue.name}
          </Text>
          {venue.offerPercent != null ? (
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', fontSize: 12, color: colors.accentDeep }}>
              {`${venue.offerPercent}%`}
            </Text>
          ) : null}
        </View>
        <View
          style={{
            width: 8,
            height: 8,
            marginTop: -5,
            backgroundColor: colors.card,
            borderRightWidth: 1.5,
            borderBottomWidth: 1.5,
            borderColor: colors.ink,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </Marker>
  );
}
