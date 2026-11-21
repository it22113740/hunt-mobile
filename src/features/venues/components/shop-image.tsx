import { CachedImage } from '@/components/cached-image';
import { Placeholder } from '@/components/ui/decor';
import { Label } from '@/components/ui/typography';
import { useSurfaces } from '@/theme/surfaces';
import { View } from 'react-native';

/** Frame for every shop photo. Matches the Nearby Spots listing and shows the whole picture. */
export const SHOP_IMAGE_SIZE = 76;

type ShopImageProps = {
  uri?: string | null;
  label?: string;
};

export function ShopImage({ uri, label = 'Place' }: ShopImageProps) {
  const { colors, surfaces } = useSurfaces();
  if (!uri) {
    return (
      <Placeholder style={{ width: SHOP_IMAGE_SIZE, height: SHOP_IMAGE_SIZE }}>
        <Label>{label}</Label>
      </Placeholder>
    );
  }
  return (
    <View
      style={[
        surfaces.image,
        {
          width: SHOP_IMAGE_SIZE,
          height: SHOP_IMAGE_SIZE,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: colors.placeholder,
        },
      ]}>
      <CachedImage
        source={{ uri }}
        style={{ width: SHOP_IMAGE_SIZE, height: SHOP_IMAGE_SIZE }}
        contentFit="contain"
        accessibilityLabel={label}
      />
    </View>
  );
}
