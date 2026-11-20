import { Body } from '@/components/ui/typography';
import type { Venue } from '@/features/venues/schemas';
import { useSurfaces } from '@/theme/surfaces';
import { Maximize2, X } from 'lucide-react-native';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type VenueMapProps = {
  venues: Venue[];
  latitude?: number;
  longitude?: number;
  onSelect: (venueId: string) => void;
  /** Venues inside the current map view, so the caption can follow pan and zoom. */
  onVisibleCount?: (count: number) => void;
  height?: number;
};

export type MapSeed = {
  /** Longitude, latitude. */
  center: [number, number];
  zoom: number;
};

export function useMapExpansion() {
  const viewRef = useRef<MapSeed | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [cardSeed, setCardSeed] = useState<MapSeed | null>(null);
  const [fullSeed, setFullSeed] = useState<MapSeed | null>(null);
  const [cardKey, setCardKey] = useState(0);

  const remember = (seed: MapSeed) => {
    viewRef.current = seed;
  };

  const expand = () => {
    setFullSeed(viewRef.current);
    setExpanded(true);
  };

  const collapse = () => {
    setCardSeed(viewRef.current);
    setCardKey((key) => key + 1);
    setExpanded(false);
  };

  return { expanded, cardSeed, fullSeed, cardKey, remember, expand, collapse };
}

type MapChromeProps = {
  height?: number;
  expanded?: boolean;
  caption?: string;
  onExpand?: () => void;
  onClose?: () => void;
  children: ReactNode;
};

export function MapChrome({ height = 210, expanded = false, caption, onExpand, onClose, children }: MapChromeProps) {
  const insets = useSafeAreaInsets();
  const { colors, surfaces } = useSurfaces();

  return (
    <View
      style={
        expanded
          ? { flex: 1, height: '100%', backgroundColor: colors.mapBg }
          : { height, backgroundColor: colors.mapBg, overflow: 'hidden' }
      }>
      {children}
      <View pointerEvents="box-none" style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        {onExpand ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Enlarge map"
            onPress={onExpand}
            hitSlop={8}
            style={[
              surfaces.iconButton,
              {
                position: 'absolute',
                top: 8,
                right: 8,
                width: 36,
                height: 36,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <Maximize2 color={colors.ink} size={16} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        {onClose ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close map"
            onPress={onClose}
            hitSlop={8}
            style={[
              surfaces.iconButton,
              {
                position: 'absolute',
                top: insets.top + 10,
                left: 12,
                width: 40,
                height: 40,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}>
            <X color={colors.ink} size={18} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        {expanded && caption ? (
          <View
            pointerEvents="none"
            style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 14, alignItems: 'center' }}>
            <View
              style={[
                surfaces.iconButton,
                { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: colors.paper },
              ]}>
              <Body size={15} weight="semibold">
                {caption}
              </Body>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
