import { Body } from '@/components/ui/typography';
import { FormError } from '@/features/auth/components/auth-scaffold';
import { loginWithGoogle } from '@/features/auth/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/stores/auth';
import { useSurfaces } from '@/theme/surfaces';
import { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

type GoogleSignInButtonProps = {
  role?: 'USER' | 'OWNER';
};

type GoogleIdentity = {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential?: string }) => void;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
};

function googleIdentity(): GoogleIdentity | null {
  return (window as Window & { google?: { accounts?: { id?: GoogleIdentity } } }).google?.accounts?.id ?? null;
}

function loadGoogleIdentity(): Promise<void> {
  if (googleIdentity()) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Could not load Google sign-in.'));
    document.head.appendChild(script);
  });
}

export function GoogleSignInButton({ role }: GoogleSignInButtonProps) {
  const { colors } = useSurfaces();
  const establishSession = useAuthStore((state) => state.establishSession);
  const setSession = useAuthStore((state) => state.setSession);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const roleRef = useRef(role);
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  roleRef.current = role;

  useEffect(() => {
    let cancelled = false;
    const clientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
    if (!clientId) {
      setError('Google sign-in is not configured.');
      return;
    }

    void loadGoogleIdentity()
      .then(() => {
        const identity = googleIdentity();
        const host = hostRef.current;
        if (cancelled || !identity || !host) return;
        identity.initialize({
          client_id: clientId,
          callback: (response) => {
            if (!response.credential) return;
            setError(null);
            setSigningIn(true);
            const currentRole = roleRef.current;
            const credential = response.credential;
            void loginWithGoogle(currentRole ? { idToken: credential, role: currentRole } : { idToken: credential })
              .then(async (session) => {
                if (session.user) await setSession(session.accessToken, session.user);
                else await establishSession(session.accessToken);
              })
              .catch((signInError: unknown) => {
                setSigningIn(false);
                setError(getApiErrorMessage(signInError, 'Could not sign in with Google.'));
              });
          },
        });
        host.replaceChildren();
        identity.renderButton(host, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'continue_with',
          shape: 'rectangular',
          width: Math.max(host.offsetWidth, 280),
          logo_alignment: 'left',
        });
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Could not load Google sign-in.');
      });

    return () => {
      cancelled = true;
    };
  }, [establishSession, setSession]);

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
      {signingIn ? (
        <Body size={14} color={colors.mute} style={{ textAlign: 'center' }}>
          Signing in…
        </Body>
      ) : null}
      <div ref={hostRef} style={{ minHeight: 44, display: signingIn ? 'none' : 'block' }} />
    </View>
  );
}
