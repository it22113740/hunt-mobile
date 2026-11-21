import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Hand } from '@/components/ui/typography';
import { useHuntColors } from '@/theme/colors';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function ScanScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useHuntColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [typing, setTyping] = useState(Platform.OS === 'web');
  const [code, setCode] = useState('');
  const locked = useRef(false);
  const asked = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web' || asked.current || !permission) return;
    if (!permission.granted && permission.canAskAgain) {
      asked.current = true;
      void requestPermission();
    }
  }, [permission, requestPermission]);
  const cameraReady = Platform.OS !== 'web' && permission?.granted === true;

  function openCode(value: string) {
    const next = value.trim();
    if (next.length < 2 || locked.current) return;
    locked.current = true;
    router.replace({ pathname: '/(owner)/scan-result', params: { code: next } });
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.viewerBg }}>
      {cameraReady ? (
        <CameraView
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => openCode(data)}
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
        />
      ) : null}
      <View style={{ flex: 1, paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}>
        <IconButton
          icon={X}
          label="Close"
          color={colors.viewerText}
          onPress={() => router.back()}
          style={{ backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.viewerBorder }}
        />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          {cameraReady ? <Finder /> : null}
          <Text
            style={{
              marginTop: cameraReady ? 28 : 0,
              fontFamily: 'BricolageGrotesque_700Bold',
              fontSize: 28,
              lineHeight: 32,
              color: colors.viewerText,
              textAlign: 'center',
            }}>
            {cameraReady ? 'Point at the code' : 'Camera is off'}
          </Text>
          <Hand>{cameraReady ? 'on their phone' : 'type the code instead'}</Hand>
          {Platform.OS !== 'web' && permission && !permission.granted ? (
            <View style={{ marginTop: 22, alignSelf: 'stretch' }}>
              <Button
                label={permission.canAskAgain ? 'Allow camera' : 'Camera is blocked'}
                disabled={!permission.canAskAgain}
                onPress={() => void requestPermission()}
              />
            </View>
          ) : null}
        </View>
        {typing ? (
          <View style={{ gap: 10 }}>
            <TextInput
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              placeholder="RWD-XXXXXXXX"
              placeholderTextColor={colors.viewerMute}
              autoCapitalize="characters"
              autoCorrect={false}
              autoFocus
              accessibilityLabel="Type the code"
              selectionColor={colors.accent}
              style={{
                height: 52,
                borderRadius: 10,
                borderWidth: 1.5,
                borderColor: colors.viewerBorder,
                paddingHorizontal: 16,
                fontFamily: 'IBMPlexMono_500Medium',
                fontSize: 18,
                letterSpacing: 1.2,
                color: colors.viewerText,
              }}
            />
            <Button label="Look up" disabled={code.trim().length < 2} onPress={() => openCode(code)} />
          </View>
        ) : (
          <Button label="Type the code" variant="secondary" onPress={() => setTyping(true)} />
        )}
      </View>
    </View>
  );
}

function Finder() {
  const colors = useHuntColors();
  const corner = {
    position: 'absolute' as const,
    width: 28,
    height: 28,
    borderColor: colors.accent,
  };
  return (
    <View style={{ width: 220, height: 220 }}>
      <View style={[corner, { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[corner, { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3 }]} />
      <View style={[corner, { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3 }]} />
      <View style={[corner, { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3 }]} />
      <View style={{ position: 'absolute', left: 18, right: 18, top: '48%', height: 2, backgroundColor: colors.accent }} />
    </View>
  );
}
