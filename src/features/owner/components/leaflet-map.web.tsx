import { MapChrome, type MapSeed } from '@/features/venues/components/map-chrome';
import { zoomForRadius } from '@/features/venues/components/map-style';
import { useHuntColors } from '@/theme/colors';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Circle, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';

const PIN_HINT = 'Move the map until the pin is on your door';

export type LeafletMapProps = {
  lat: number;
  lng: number;
  radiusMeters: number;
  onChange: (pin: { lat: number; lng: number }) => void;
  expanded?: boolean;
  seed?: MapSeed | null;
  onExpand?: () => void;
  onClose?: () => void;
  onView?: (seed: MapSeed) => void;
};

function FollowPin({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    const center = map.getCenter();
    if (Math.abs(center.lat - lat) < 1e-6 && Math.abs(center.lng - lng) < 1e-6) return;
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);
  return null;
}

function ResizeMap({ expanded }: { expanded: boolean }) {
  const map = useMap();
  useEffect(() => {
    const frame = requestAnimationFrame(() => map.invalidateSize());
    const attribution = map.getContainer().querySelector('.leaflet-control-attribution');
    if (attribution instanceof HTMLElement) attribution.style.marginBottom = expanded ? '72px' : '0px';
    return () => cancelAnimationFrame(frame);
  }, [expanded, map]);
  return null;
}

/** The pin stays in the middle. Panning or tapping moves the place under it. */
function PlacePin({ onChange, onView }: { onChange: LeafletMapProps['onChange']; onView?: (seed: MapSeed) => void }) {
  const map = useMap();

  const remember = () => {
    const center = map.getCenter();
    onView?.({ center: [center.lng, center.lat], zoom: map.getZoom() });
  };

  useMapEvents({
    moveend: remember,
    zoomend: remember,
    dragend: () => {
      const center = map.getCenter();
      onChange({ lat: center.lat, lng: center.lng });
    },
    click: (event) => {
      onChange({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });
  return null;
}

export function LeafletMap({
  lat,
  lng,
  radiusMeters,
  onChange,
  expanded = false,
  seed = null,
  onExpand,
  onClose,
  onView,
}: LeafletMapProps) {
  const colors = useHuntColors();
  const [radiusZoom] = useState(() => zoomForRadius(radiusMeters));
  const center = seed?.center ?? [lng, lat];

  return (
    <MapChrome height={230} expanded={expanded} caption={PIN_HINT} onExpand={onExpand} onClose={onClose}>
      <View style={{ flex: 1, height: expanded ? '100%' : 230 }}>
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
          <MapContainer
            center={[center[1], center[0]]}
            zoom={seed?.zoom ?? radiusZoom}
            minZoom={3}
            maxZoom={18}
            zoomControl={expanded}
            style={{ height: '100%', width: '100%', background: colors.mapBg }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ResizeMap expanded={expanded} />
            <FollowPin lat={lat} lng={lng} />
            <PlacePin onChange={onChange} onView={onView} />
            <Circle
              center={[lat, lng]}
              radius={radiusMeters}
              interactive={false}
              pathOptions={{
                color: colors.accentDeep,
                weight: 1.5,
                dashArray: '5 4',
                fillColor: colors.accent,
                fillOpacity: 0.12,
              }}
            />
          </MapContainer>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              zIndex: 500,
              pointerEvents: 'none',
              transform: 'translate(-50%, -100%)',
            }}>
            <svg width="30" height="40" viewBox="-15 -38 30 40" aria-hidden="true">
              <path
                d="M0 0c-9-11-13-17-13-23a13 13 0 0 1 26 0c0 6-4 12-13 23z"
                fill={colors.accent}
                stroke={colors.ink}
                strokeWidth="1.6"
              />
              <circle cy="-23" r="4" fill={colors.ink} />
            </svg>
          </div>
        </div>
      </View>
    </MapChrome>
  );
}
