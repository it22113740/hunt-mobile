import { PressScale } from '@/components/ui/press-scale';
import { CachedImage } from '@/components/cached-image';
import { ImageIcon } from '@/components/ui/hunt-icons';
import { MediaViewer } from '@/components/ui/media-viewer';
import { hapticWarning } from '@/components/ui/press';
import { Body } from '@/components/ui/typography';
import { uploadImage } from '@/features/owner/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useSurfaces } from '@/theme/surfaces';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type ImageFieldProps = {
  url: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  height?: number;
  /** Crop to a square and save at this size, in pixels, on each side. The preview is square. */
  squarePixels?: number;
};

async function toSquareJpeg(uri: string, width: number, height: number, pixels: number) {
  const side = Math.min(width, height);
  const actions =
    side > 0
      ? [
          {
            crop: {
              originX: Math.round((width - side) / 2),
              originY: Math.round((height - side) / 2),
              width: side,
              height: side,
            },
          },
          { resize: { width: pixels, height: pixels } },
        ]
      : [{ resize: { width: pixels, height: pixels } }];
  const result = await manipulateAsync(uri, actions, { compress: 0.85, format: SaveFormat.JPEG });
  return result.uri;
}

export function ImageField({
  url,
  onChange,
  label = 'Add a cover photo',
  hint = 'Your front door works best. It’s what guests look for.',
  height = 170,
  squarePixels,
}: ImageFieldProps) {
  const { colors, surfaces } = useSurfaces();
  const [uploading, setUploading] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async () => {
    setError(null);
    let result: ImagePicker.ImagePickerResult;
    try {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: squarePixels ? 1 : 0.8,
        allowsEditing: Boolean(squarePixels),
        aspect: squarePixels ? [1, 1] : undefined,
      });
    } catch {
      hapticWarning();
      setError('Could not open the photo picker.');
      return;
    }
    const asset = result.assets?.[0];
    if (result.canceled || !asset) return;
    setUploading(true);
    try {
      const uri = squarePixels
        ? await toSquareJpeg(asset.uri, asset.width, asset.height, squarePixels)
        : asset.uri;
      const mediaUrl = await uploadImage({
        uri,
        name: squarePixels ? 'photo.jpg' : (asset.fileName ?? 'photo.jpg'),
        type: squarePixels ? 'image/jpeg' : (asset.mimeType ?? 'image/jpeg'),
      });
      onChange(mediaUrl);
    } catch (uploadError) {
      hapticWarning();
      setError(getApiErrorMessage(uploadError, 'Could not upload that photo.'));
    } finally {
      setUploading(false);
    }
  };

  const frame = squarePixels ? { width: '100%' as const, aspectRatio: 1 } : { height };

  return (
    <View style={{ gap: 8 }}>
      <View>
        {url ? (
          <View style={[surfaces.image, frame, { borderRadius: 10, overflow: 'hidden' }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="View photo"
              onPress={() => setViewing(true)}
              style={{ flex: 1 }}>
              <CachedImage source={{ uri: url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </Pressable>
            <PressScale
              accessibilityRole="button"
              accessibilityLabel="Change photo"
              onPress={() => void pick()}
              style={[
                surfaces.iconButton,
                {
                  position: 'absolute',
                  right: 12,
                  bottom: 12,
                  height: 36,
                  paddingHorizontal: 14,
                  borderRadius: 99,
                  justifyContent: 'center',
                },
              ]}>
              <Text style={{ fontFamily: 'BricolageGrotesque_600SemiBold', fontSize: 14, color: colors.ink }}>Change</Text>
            </PressScale>
          </View>
        ) : (
          <PressScale
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityHint={hint}
            onPress={() => void pick()}
            style={[
              surfaces.dashed,
              {
                ...frame,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                paddingHorizontal: 24,
              },
            ]}>
            <ImageIcon color={colors.accentDeep} size={28} strokeWidth={1.6} />
            <Body size={16} weight="bold">
              {label}
            </Body>
            <Body size={13} color={colors.mute} style={{ textAlign: 'center' }}>
              {hint}
            </Body>
          </PressScale>
        )}
        {uploading ? (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: colors.scrim,
            }}>
            <ActivityIndicator color={colors.card} />
          </View>
        ) : null}
      </View>
      {error ? (
        <Body size={13} color={colors.danger}>
          {error}
        </Body>
      ) : null}
      <MediaViewer url={viewing ? url : null} kind={viewing && url ? 'PHOTO' : null} onClose={() => setViewing(false)} />
    </View>
  );
}
