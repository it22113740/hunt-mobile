export class GoogleSignInCancelled extends Error {
  constructor() {
    super('Google sign-in was cancelled');
    this.name = 'GoogleSignInCancelled';
  }
}

export async function requestGoogleIdToken(): Promise<string> {
  throw new Error('Use the Google button on this page.');
}

export async function signOutGoogle() {
  // The browser test does not keep a Google session inside Hunt.
}
