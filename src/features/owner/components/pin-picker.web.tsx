import { Body } from '@/components/ui/typography';
import { PinPickerFrame, type PinPickerProps } from '@/features/owner/components/pin-picker-frame';
import { useMapExpansion, type MapSeed } from '@/features/venues/components/map-chrome';
import { useSurfaces } from '@/theme/surfaces';
import { useEffect, useState, type ComponentType } from 'react';
import { Modal, View } from 'react-native';

type OwnerMapProps = PinPickerProps & {
  expanded?: boolean;
  seed?: MapSeed | null;
  onExpand?: () => void;
  onClose?: () => void;
  onView?: (seed: MapSeed) => void;
};

export function PinPicker({ lat, lng, radiusMeters, onChange }: PinPickerProps) {
  const { colors } = useSurfaces();
  const expansion = useMapExpansion();
  const [MapView, setMapView] = useState<ComponentType<OwnerMapProps> | null>(null);

  useEffect(() => {
    let alive = true;
    void import('./leaflet-map.web').then((mod) => {
      if (alive) setMapView(() => mod.LeafletMap);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <PinPickerFrame lat={lat} lng={lng} onChange={onChange}>
        {MapView ? (
          <MapView
            key={expansion.cardKey}
            lat={lat}
            lng={lng}
            radiusMeters={radiusMeters}
            seed={expansion.cardSeed}
            onChange={onChange}
            onExpand={expansion.expand}
            onView={expansion.expanded ? undefined : expansion.remember}
          />
        ) : (
          <View style={{ height: 230, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mapBg }}>
            <Body size={14} color={colors.mute}>
              Loading map
            </Body>
          </View>
        )}
      </PinPickerFrame>
      <Modal
        visible={expansion.expanded}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={expansion.collapse}>
        {expansion.expanded && MapView ? (
          <MapView
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
