import { CachedImage } from '@/components/cached-image';
import { showToast } from '@/components/toast';
import { Button } from '@/components/ui/button';
import { DashRule, Polaroid, Stamp, Tape } from '@/components/ui/decor';
import { hapticSuccess, hapticWarning } from '@/components/ui/press';
import { Body, Hand, Label, Sub } from '@/components/ui/typography';
import type { VisitFile } from '@/features/capture/api';
import { VoucherQr } from '@/features/perk-hunters/components/voucher-qr';
import { useAddPerkShot } from '@/features/wallet/hooks';
import type { Redemption } from '@/features/wallet/schemas';
import { getApiErrorMessage } from '@/lib/api-error';
import { monthDay } from '@/lib/dates';
import { useSurfaces } from '@/theme/surfaces';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Copy } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn, useReducedMotion } from 'react-native-reanimated';

type PromoModalProps = {
  redemption: Redemption | null;
  onClose: () => void;
  onShot?: (redemptionId: string, mediaUrl: string) => void;
};

export function PromoModal({ redemption, onClose, onShot }: PromoModalProps) {
  const { colors, surfaces, isJournal } = useSurfaces();
  const addShot = useAddPerkShot();
  const reduceMotion = useReducedMotion();
  const closeRef = useRef(onClose);
  const [posted, setPosted] = useState<string | null>(null);
  const [forId, setForId] = useState<string | null>(redemption?.id ?? null);
  const redemptionId = redemption?.id ?? null;
  if (redemptionId !== forId) {
    setForId(redemptionId);
    setPosted(null);
  }
  const used = redemption?.status === 'USED';
  const hasShot = Boolean(redemption?.shot?.mediaUrl);

  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!posted) return;
    const timer = setTimeout(() => closeRef.current(), 1700);
    return () => clearTimeout(timer);
  }, [posted]);

  const pick = async (source: 'camera' | 'library') => {
    if (!redemption || addShot.isPending) return;
    try {
      if (source === 'camera') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          hapticWarning();
          showToast('Allow the camera to snap this perk.', 'warning');
          return;
        }
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
      const asset = result.canceled ? null : result.assets[0];
      if (!asset) return;
      const file: VisitFile = {
        uri: asset.uri,
        name: asset.fileName ?? 'perk.jpg',
        mime: asset.mimeType ?? 'image/jpeg',
        type: 'PHOTO',
      };
      const saved = await addShot.mutateAsync({ redemptionId: redemption.id, file });
      onShot?.(saved.redemptionId, saved.mediaUrl);
      hapticSuccess();
      setPosted(asset.uri);
    } catch (error) {
      showToast(getApiErrorMessage(error, 'Could not add that photo.'), 'warning');
    }
  };

  const copy = async () => {
    if (!redemption) return;
    await Clipboard.setStringAsync(redemption.promoCode);
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('Code copied');
  };

  return (
    <Modal visible={Boolean(redemption)} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <Pressable
        accessibilityRole={posted ? 'button' : undefined}
        accessibilityLabel={posted ? 'Photo submitted. It’s on the store.' : undefined}
        onPress={posted ? onClose : undefined}
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 20,
          backgroundColor: colors.scrim,
        }}>
        <Animated.View
          entering={ZoomIn.duration(220)}
          accessibilityViewIsModal
          style={[surfaces.raised, { width: '100%', maxWidth: 420 }]}>
          <Tape rotate={-5} style={{ top: -12, left: 24 }} />
          <Tape ash rotate={6} style={{ top: -12, right: 24 }} />
          {posted ? (
            <ShotSubmitted uri={posted} reduceMotion={Boolean(reduceMotion)} />
          ) : (
            <>
              <View style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 18, gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Label>Your code</Label>
                  <Stamp label={used ? 'Used' : 'Ready'} tone={used ? 'used' : 'wait'} rotate={-4} />
                </View>
                <Text
                  selectable
                  accessibilityLabel={`Code ${redemption?.promoCode.split('').join(' ')}`}
                  style={{
                    fontFamily: 'IBMPlexMono_500Medium',
                    fontSize: 26,
                    letterSpacing: 1.6,
                    color: used ? colors.mute : colors.ink,
                    textDecorationLine: used ? 'line-through' : 'none',
                  }}>
                  {redemption?.promoCode}
                </Text>
                {!used && redemption ? (
                  <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                    <VoucherQr value={redemption.promoCode} size={148} label="QR code for this perk" />
                  </View>
                ) : null}
                <Body size={17} weight="bold">
                  {redemption?.perk.title}
                </Body>
                {redemption ? (
                  <Body size={13} color={colors.mute}>
                    {`${redemption.perk.venue.name} · ${redemption.pointsSpent} pts · ${monthDay(redemption.createdAt)}`}
                  </Body>
                ) : null}
              </View>
              <DashRule width={isJournal ? 1.5 : 1} />
              <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 10 }}>
                <Sub size={14}>Show this at the counter. They scan the code once.</Sub>
                {!used ? <Hand>enjoy it!</Hand> : null}
                {hasShot ? (
                  <Sub size={14}>Your photo of this perk is on the store page.</Sub>
                ) : (
                  <>
                    <Button
                      label="Snap this perk"
                      loading={addShot.isPending}
                      leftIcon={<Camera color={colors.onAccent} size={18} />}
                      onPress={() => void pick('camera')}
                    />
                    <Button label="Choose a photo" variant="secondary" disabled={addShot.isPending} onPress={() => void pick('library')} />
                  </>
                )}
                <Button label="Copy code" leftIcon={<Copy color={colors.onAccent} size={18} />} onPress={() => void copy()} />
                <Button label="Done" variant="secondary" onPress={onClose} />
              </View>
            </>
          )}
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function ShotSubmitted({ uri, reduceMotion }: { uri: string; reduceMotion: boolean }) {
  const enter = reduceMotion ? FadeIn.duration(180) : ZoomIn.springify().damping(12);
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ alignItems: 'center', paddingHorizontal: 20, paddingTop: 28, paddingBottom: 26, gap: 16 }}>
      <Animated.View entering={enter}>
        <Polaroid rotate={-3}>
          <CachedImage
            source={{ uri }}
            style={{ width: 168, height: 168, backgroundColor: '#E7E1D6' }}
            contentFit="cover"
            accessibilityIgnoresInvertColors
          />
        </Polaroid>
      </Animated.View>
      <Animated.View entering={reduceMotion ? FadeIn.duration(180) : ZoomIn.springify().damping(9).delay(140)}>
        <Stamp label="Submitted" tone="wait" heavy rotate={-8} />
      </Animated.View>
      <Hand size={22}>on the store</Hand>
    </View>
  );
}
