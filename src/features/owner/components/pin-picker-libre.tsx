import { PinPickerFrame, type PinPickerProps } from '@/features/owner/components/pin-picker-frame';
import { MapChrome, useMapExpansion, type MapSeed } from '@/features/venues/components/map-chrome';
import { circlePolygon, MapPin, sketchMapStyle, zoomForRadius } from '@/features/venues/components/map-style';
import { useHuntColors } from '@/theme/colors';
import { Camera, GeoJSONSource, Layer, Map, type CameraRef } from '@maplibre/maplibre-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View } from 'react-native';

const PIN_SIZE = 30;
const PIN_HINT = 'Move the map until the pin is on your door';

/** The pin stays in the middle; moving the map (or tapping a spot) moves the place under it. */
export function PinPickerLibre({ lat, lng, radiusMeters, onChange }: PinPickerProps) {
  const expansion = useMapExpansion();

  return (
    <>
      <PinPickerFrame lat={lat} lng={lng} onChange={onChange}>
        <PickerMap
          key={expansion.cardKey}
          lat={lat}
          lng={lng}
          radiusMeters={radiusMeters}
          seed={expansion.cardSeed}
          onChange={onChange}
          onExpand={expansion.expand}
          onView={expansion.expanded ? undefined : expansion.remember}
        />
      </PinPickerFrame>
      <Modal
        visible={expansion.expanded}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        onRequestClose={expansion.collapse}>
        {expansion.expanded ? (
          <PickerMap
            lat={lat}
            lng={lng}
            radiusMeters={radiusMeters}
            expanded
            seed={expansion.fullSeed}
            onChange={onChange}
            onClose={expansion.collapse}
            onView={expansion.remember}
          />
        ) : null}
      </Modal>
    </>
  );
}

function PickerMap({
  lat,
  lng,
  radiusMeters,
  expanded = false,
  seed,
  onChange,
  onExpand,
  onClose,
  onView,
}: PinPickerProps & {
  expanded?: boolean;
  seed: MapSeed | null;
  onExpand?: () => void;
  onClose?: () => void;
  onView?: (seed: MapSeed) => void;
}) {
  const colors = useHuntColors();
  const mapStyle = useMemo(() => sketchMapStyle(colors), [colors]);
  const camera = useRef<CameraRef>(null);
  const center = useRef({
    lat: seed?.center[1] ?? lat,
    lng: seed?.center[0] ?? lng,
  });
  const [radiusZoom] = useState(() => zoomForRadius(radiusMeters));

  // Typed coordinates or a tap move the pin, so bring the map along to keep it centred.
  useEffect(() => {
    if (Math.abs(center.current.lat - lat) < 1e-7 && Math.abs(center.current.lng - lng) < 1e-7) return;
    center.current = { lat, lng };
    camera.current?.easeTo({ center: [lng, lat], duration: 300 });
  }, [lat, lng]);

  return (
    <MapChrome
      height={230}
      expanded={expanded}
      caption={PIN_HINT}
      onExpand={onExpand}
      onClose={onClose}>
      <Map
        style={{ flex: 1 }}
        mapStyle={mapStyle}
        androidView="texture"
        logo={false}
        compass={false}
        attributionPosition={{ bottom: expanded ? 96 : 6, right: 6 }}
        touchRotate={false}
        touchPitch={false}
        accessibilityLabel="Map with a pin and the check-in circle. Move the map until the pin is on your door."
        onPress={(event) => {
          const [nextLng, nextLat] = event.nativeEvent.lngLat;
          onChange({ lat: nextLat, lng: nextLng });
        }}
        onRegionDidChange={(event) => {
          const region = event.nativeEvent;
          onView?.({ center: region.center, zoom: region.zoom });
          if (!region.userInteraction) return;
          const [nextLng, nextLat] = region.center;
          center.current = { lat: nextLat, lng: nextLng };
          onChange({ lat: nextLat, lng: nextLng });
        }}>
        <Camera
          ref={camera}
          initialViewState={{ center: seed?.center ?? [lng, lat], zoom: seed?.zoom ?? radiusZoom }}
        />
        <GeoJSONSource id="check-in-circle" data={circlePolygon(lat, lng, radiusMeters)}>
          <Layer id="check-in-fill" type="fill" paint={{ 'fill-color': colors.accent, 'fill-opacity': 0.12 }} />
          <Layer
            id="check-in-outline"
            type="line"
            paint={{ 'line-color': colors.accentDeep, 'line-width': 1.5, 'line-dasharray': [3, 2.5] }}
          />
        </GeoJSONSource>
      </Map>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          marginLeft: -PIN_SIZE / 2,
          marginTop: -(PIN_SIZE * 4) / 3,
        }}>
        <MapPin colors={colors} size={PIN_SIZE} />
      </View>
    </MapChrome>
  );
}
