import { showToast } from '@/components/toast';
import { PressScale } from '@/components/ui/press-scale';
import { hapticSuccess } from '@/components/ui/press';
import { saveGuestMedia, type GuestMediaKind } from '@/lib/save-media';
import { useHuntTheme } from '@/theme/colors';
import { Check, Download } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, View, type StyleProp, type ViewStyle } from 'react-native';

type DownloadMediaButtonProps = {
  url: string;
  kind: GuestMediaKind;
  /** `overlay` sits on a photo. `viewer` matches the full-screen close button. */
  tone?: 'overlay' | 'viewer';
  style?: StyleProp<ViewStyle>;
};

export function DownloadMediaButton({ url, kind, tone = 'overlay', style }: DownloadMediaButtonProps) {
  const { colors } = useHuntTheme();
  const [phase, setPhase] = useState<'idle' | 'busy' | 'done'>('idle');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const label = kind === 'VIDEO' ? 'Download video' : 'Download photo';
  const viewer = tone === 'viewer';
  const iconColor = viewer ? colors.viewerText : '#FFFFFF';

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const onPress = () => {
    if (phase === 'busy') return;
    if (timer.current) clearTimeout(timer.current);
    setPhase('busy');
    void saveGuestMedia(url, kind)
      .then((result) => {
        if (result === 'shared') {
          setPhase('idle');
          return;
        }
        hapticSuccess();
        const noun = kind === 'VIDEO' ? 'Video' : 'Photo';
        showToast(result === 'browser' ? 'Download started' : `${noun} saved to your library`, 'success');
        setPhase('done');
        timer.current = setTimeout(() => setPhase('idle'), 1600);
      })
      .catch(() => {
        setPhase('idle');
        const message = kind === 'VIDEO' ? 'Couldn’t download this video.' : 'Couldn’t download this photo.';
        if (viewer) Alert.alert('Download failed', message);
        else showToast(message, 'warning');
      });
  };

  return (
    <PressScale
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: phase === 'busy', busy: phase === 'busy' }}
      disabled={phase === 'busy'}
      hitSlop={6}
      onPress={onPress}
      style={[{ width: viewer ? 44 : 40, height: viewer ? 44 : 40, zIndex: 2 }, style]}>
      <View
        style={{
          width: viewer ? 44 : 40,
          height: viewer ? 44 : 40,
          borderRadius: 99,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: viewer ? 'transparent' : 'rgba(24,24,26,0.78)',
          borderWidth: 1.5,
          borderColor: viewer ? colors.viewerBorder : 'rgba(255,255,255,0.9)',
        }}>
        {phase === 'busy' ? (
          <ActivityIndicator color={iconColor} size="small" />
        ) : phase === 'done' ? (
          <Check color={iconColor} size={18} strokeWidth={2.2} />
        ) : (
          <Download color={iconColor} size={18} strokeWidth={2.2} />
        )}
      </View>
    </PressScale>
  );
}
