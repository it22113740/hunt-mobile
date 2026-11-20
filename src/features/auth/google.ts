import { Platform } from 'react-native';

export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled');
    this.name = 'GoogleSignInCancelled';
  }
}

let configured = false;

export async function requestGoogleIdToken(): Promise<string> {
  if (Platform.OS === 'web') {
    throw new Error('Google sign-in is available in the Hunt app on your phone.');
  }

  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new Error('Google sign-in is not configured.');
  }

  const google = await import('@react-native-google-signin/google-signin');
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = google;

  if (!configured) {
    GoogleSignin.configure({ webClientId });
    configured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    try {
      await GoogleSignin.signOut();
    } catch {
      // No Google session is stored yet.
    }
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response) || !response.data.idToken) {
      if (!isSuccessResponse(response)) throw new GoogleSignInCancelled();
      throw new Error('Google did not return a sign-in token.');
    }
    return response.data.idToken;
  } catch (error) {
    if (error instanceof GoogleSignInCancelled) throw error;
    if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new GoogleSignInCancelled();
    }
    if (isErrorWithCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      throw new Error('Google Play services are missing or out of date.');
    }
    if (isErrorWithCode(error) && error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Google sign-in is already open.');
    }
    if (isNativeMissing(error)) {
      throw new Error('Google sign-in needs a Hunt build. It does not run inside Expo Go.');
    }
    throw error;
  }
}

export async function signOutGoogle() {
  if (Platform.OS === 'web') return;
  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // Native sign-in may be unavailable in this build.
  }
}

function isNativeMissing(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /native module|could not be found|RNGoogleSignin/i.test(message);
}
