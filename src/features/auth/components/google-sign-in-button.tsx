import { Button } from '@/components/ui/button';
import { Body } from '@/components/ui/typography';
import { FormError } from '@/features/auth/components/auth-scaffold';
import { loginWithGoogle } from '@/features/auth/api';
import { GoogleSignInCancelled, requestGoogleIdToken } from '@/features/auth/google';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth';
import { useSurfaces } from '@/theme/surfaces';
import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type GoogleSignInButtonProps = {
  role?: 'USER' | 'OWNER';
};

export function GoogleSignInButton({ role }: GoogleSignInButtonProps) {
  const { colors } = useSurfaces();
  const establishSession = useAuthStore((state) => state.establishSession);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onPress = async () => {
    setError(null);
    setLoading(true);
    try {
      const idToken = await requestGoogleIdToken();
      const session = await loginWithGoogle(role ? { idToken, role } : { idToken });
      await establishSession(session.accessToken);
    } catch (signInError) {
      if (signInError instanceof GoogleSignInCancelled) return;
      setError(getApiErrorMessage(signInError, signInError instanceof Error ? signInError.message : 'Could not sign in with Google.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ gap: 10, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <Body size={13} color={colors.mute}>
          or
        </Body>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </View>
      <FormError message={error} />
      <Button
        label="Continue with Google"
        variant="secondary"
        onPress={() => {
          void onPress();
        }}
        loading={loading}
        leftIcon={<GoogleMark />}
      />
    </View>
  );
}

function GoogleMark() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <Path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 12 24 12c3.1 0 5.8 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <Path
        fill="#4CAF50"
        d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <Path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.1l.1.1 6.3 5.3C36.9 41.4 44 36 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </Svg>
  );
}
