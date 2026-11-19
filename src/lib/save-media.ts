import { File, Paths } from 'expo-file-system';
import { requestPermissionsAsync, saveToLibraryAsync } from 'expo-media-library/legacy';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export type GuestMediaKind = 'PHOTO' | 'VIDEO';

const PHOTO_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'gif']);
const VIDEO_EXTENSIONS = new Set(['mp4', 'mov', 'm4v', 'webm']);

const SHARE_TYPES: Record<string, { mimeType: string; UTI: string }> = {
  jpg: { mimeType: 'image/jpeg', UTI: 'public.jpeg' },
  jpeg: { mimeType: 'image/jpeg', UTI: 'public.jpeg' },
  png: { mimeType: 'image/png', UTI: 'public.png' },
  webp: { mimeType: 'image/webp', UTI: 'org.webmproject.webp' },
  heic: { mimeType: 'image/heic', UTI: 'public.heic' },
  gif: { mimeType: 'image/gif', UTI: 'com.compuserve.gif' },
  mp4: { mimeType: 'video/mp4', UTI: 'public.mpeg-4' },
  mov: { mimeType: 'video/quicktime', UTI: 'com.apple.quicktime-movie' },
  m4v: { mimeType: 'video/x-m4v', UTI: 'public.mpeg-4' },
  webm: { mimeType: 'video/webm', UTI: 'public.movie' },
};

function extensionFor(url: string, kind: GuestMediaKind) {
  const path = url.split(/[?#]/)[0] ?? '';
  const match = /\.([a-z0-9]{2,5})$/i.exec(path);
  const extension = match?.[1]?.toLowerCase();
  const allowed = kind === 'VIDEO' ? VIDEO_EXTENSIONS : PHOTO_EXTENSIONS;
  if (extension && allowed.has(extension)) return extension;
  return kind === 'VIDEO' ? 'mp4' : 'jpg';
}

function release(file: File) {
  try {
    file.delete();
  } catch {
    // The library or share sheet already has its own copy.
  }
}

/** Saves a guest photo or video onto the device. `shared` means the system share sheet was used instead. */
export async function saveGuestMedia(url: string, kind: GuestMediaKind): Promise<'library' | 'browser' | 'shared'> {
  if (Platform.OS === 'web') {
    await downloadInBrowser(url, `hunt-${kind.toLowerCase()}-${Date.now()}.${extensionFor(url, kind)}`);
    return 'browser';
  }

  const extension = extensionFor(url, kind);
  const file = await File.downloadFileAsync(
    url,
    new File(Paths.cache, `hunt-${kind.toLowerCase()}-${Date.now()}.${extension}`),
  );

  try {
    const permission = await requestPermissionsAsync(true);
    if (permission.granted) {
      await saveToLibraryAsync(file.uri);
      release(file);
      return 'library';
    }
  } catch {
    // The photo library refused the file. Offer the share sheet instead.
  }

  try {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error(kind === 'VIDEO' ? 'Could not save this video.' : 'Could not save this photo.');
    }
    const types = SHARE_TYPES[extension] ?? SHARE_TYPES[kind === 'VIDEO' ? 'mp4' : 'jpg'];
    await Sharing.shareAsync(file.uri, {
      mimeType: types?.mimeType,
      UTI: types?.UTI,
      dialogTitle: kind === 'VIDEO' ? 'Save video' : 'Save photo',
    });
    return 'shared';
  } finally {
    release(file);
  }
}

async function downloadInBrowser(url: string, filename: string) {
  if (typeof document === 'undefined') throw new Error('Could not download this file.');

  let href = url;
  let revoke: string | null = null;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    href = URL.createObjectURL(await response.blob());
    revoke = href;
  } catch {
    href = url;
  }

  const anchor = document.createElement('a');
  anchor.href = href;
  anchor.download = filename;
  anchor.rel = 'noopener';
  if (!revoke) anchor.target = '_blank';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  if (revoke) URL.revokeObjectURL(revoke);
}
