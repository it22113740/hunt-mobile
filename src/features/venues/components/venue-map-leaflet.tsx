import { MapChrome, useMapExpansion, type MapSeed, type VenueMapProps } from '@/features/venues/components/map-chrome';
import {
  CITY_ZOOM,
  clusterDiameter,
  formatClusterCount,
  groupVenues,
  mapCenter,
  pinLabel,
  venueCountLabel,
  venuesInBounds,
  zoomForCluster,
} from '@/features/venues/components/venue-groups';
import { useHuntColors } from '@/theme/colors';
import 'leaflet/dist/leaflet.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

export function VenueMapLeaflet({ onSelect, onVisibleCount, ...props }: VenueMapProps) {
  const expansion = useMapExpansion();

  const select = (venueId: string) => {
    if (expansion.expanded) expansion.collapse();
    onSelect(venueId);
  };

  return (
    <>
      <WebMap
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
        onRequestClose={expansion.collapse}>
        {expansion.expanded ? (
          <WebMap
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

function WebMap({
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
  const [lng, lat] = seed?.center ?? mapCenter(venues, latitude, longitude);
  const zoom = seed?.zoom ?? CITY_ZOOM;
  const [areaCount, setAreaCount] = useState(venues.length);
  const onVisibleCountRef = useRef(onVisibleCount);
  onVisibleCountRef.current = onVisibleCount;
  const reportCount = useCallback((count: number) => {
    setAreaCount(count);
    onVisibleCountRef.current?.(count);
  }, []);

  return (
    <MapChrome
      height={height}
      expanded={expanded}
      caption={venueCountLabel(areaCount)}
      onExpand={onExpand}
      onClose={onClose}>
      <View style={{ flex: 1, height: expanded ? '100%' : height }}>
        <div style={{ height: '100%', width: '100%' }}>
          <MapContainer
            center={[lat, lng]}
            zoom={zoom}
            minZoom={3}
            maxZoom={18}
            zoomControl={expanded}
            style={{ height: '100%', width: '100%', background: colors.mapBg }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ResizeMap expanded={expanded} />
            <VenueLayer
              venues={venues}
              latitude={latitude}
              longitude={longitude}
              colors={colors}
              onSelect={onSelect}
              onVisibleCount={reportCount}
              onView={onView}
            />
          </MapContainer>
        </div>
      </View>
    </MapChrome>
  );
}

function ResizeMap({ expanded }: { expanded: boolean }) {
  const map = useMap();
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize());
    return () => cancelAnimationFrame(frame);
  }, [expanded, map]);
  return null;
}

function VenueLayer({
  venues,
  latitude,
  longitude,
  colors,
  onSelect,
  onVisibleCount,
  onView,
}: {
  venues: VenueMapProps['venues'];
  latitude?: number;
  longitude?: number;
  colors: ReturnType<typeof useHuntColors>;
  onSelect: (venueId: string) => void;
  onVisibleCount?: (count: number) => void;
  onView?: (seed: MapSeed) => void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [bounds, setBounds] = useState<[number, number, number, number] | null>(null);

  const publish = () => {
    const box = map.getBounds();
    const nextBounds: [number, number, number, number] = [box.getWest(), box.getSouth(), box.getEast(), box.getNorth()];
    const center = map.getCenter();
    setZoom(map.getZoom());
    setBounds(nextBounds);
    onView?.({ center: [center.lng, center.lat], zoom: map.getZoom() });
  };

  useMapEvents({
    zoomend: publish,
    moveend: publish,
  });

  useEffect(() => {
    publish();
    // The map reports its first frame once; later pans come from map events.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const visible = useMemo(() => venuesInBounds(venues, bounds, 0.45), [bounds, venues]);
  const groups = useMemo(() => groupVenues(visible, zoom), [visible, zoom]);
  const areaCount = bounds ? venuesInBounds(venues, bounds).length : venues.length;

  useEffect(() => {
    if (!bounds) return;
    onVisibleCount?.(areaCount);
  }, [areaCount, bounds, onVisibleCount]);

  return (
    <>
      {latitude !== undefined && longitude !== undefined ? (
        <Marker
          position={[latitude, longitude]}
          icon={youIcon(colors.card, colors.ink)}
          interactive={false}
          keyboard={false}
        />
      ) : null}
      {groups.map((group) => {
        if (group.kind === 'cluster') {
          const size = clusterDiameter(group.count);
          return (
            <Marker
              key={`cluster-${group.id}`}
              position={[group.lat, group.lng]}
              icon={clusterIcon(group.count, size, group.hasOffer, colors)}
              eventHandlers={{
                click: () => {
                  map.flyTo([group.lat, group.lng], zoomForCluster(zoom, group.count), { duration: 0.45 });
                },
              }}
            />
          );
        }
        return (
          <Marker
            key={group.venue.id}
            position={[group.venue.lat, group.venue.lng]}
            icon={pinIcon(group.venue.name, group.venue.offerPercent, colors, group.stack)}
            zIndexOffset={(group.venue.offerPercent ?? 0) + group.stack}
            eventHandlers={{ click: () => onSelect(group.venue.id) }}
            title={pinLabel(group.venue)}
          />
        );
      })}
    </>
  );
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return entities[char] ?? char;
  });
}

function clusterIcon(count: number, size: number, hasOffer: boolean, colors: ReturnType<typeof useHuntColors>) {
  const border = hasOffer ? colors.accent : colors.ink;
  const width = hasOffer ? 2.5 : 1.5;
  const halo = hasOffer ? 'box-shadow:0 0 0 6px rgba(252,100,1,0.28);' : 'box-shadow:0 1px 4px rgba(24,24,26,0.18);';
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div style="width:${size}px;height:${size}px;border-radius:999px;display:flex;align-items:center;justify-content:center;background:${colors.card};border:${width}px solid ${border};${halo}font-family:BricolageGrotesque_700Bold,sans-serif;font-size:${size >= 52 ? 16 : 14}px;color:${colors.ink};">${formatClusterCount(count)}</div>`,
  });
}

function pinIcon(
  name: string,
  offerPercent: number | null | undefined,
  colors: ReturnType<typeof useHuntColors>,
  stack = 0,
) {
  const offer =
    offerPercent != null
      ? `<span style="font-family:IBMPlexMono_600SemiBold,monospace;font-size:12px;color:${colors.accentDeep};">${offerPercent}%</span>`
      : '';
  const html = `<div style="display:flex;flex-direction:column;align-items:center;width:max-content;max-width:188px;">
    <div style="display:flex;align-items:center;gap:6px;max-width:188px;padding:5px 8px;border-radius:9px;background:${colors.card};border:1.5px solid ${colors.ink};box-shadow:0 2px 6px rgba(24,24,26,0.16);">
      <span style="font-family:BricolageGrotesque_600SemiBold,sans-serif;font-size:13px;color:${colors.ink};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:124px;">${escapeHtml(name)}</span>
      ${offer}
    </div>
    <div style="width:8px;height:8px;margin-top:-5px;background:${colors.card};border-right:1.5px solid ${colors.ink};border-bottom:1.5px solid ${colors.ink};transform:rotate(45deg);"></div>
  </div>`;
  return L.divIcon({
    className: '',
    iconSize: [188, 40],
    iconAnchor: [94, 40 + stack * 38],
    html,
  });
}

function youIcon(fill: string, ink: string) {
  return L.divIcon({
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="width:14px;height:14px;border-radius:7px;background:${fill};border:1.6px solid ${ink};display:flex;align-items:center;justify-content:center;"><div style="width:5px;height:5px;border-radius:3px;background:${ink};"></div></div>`,
  });
}
