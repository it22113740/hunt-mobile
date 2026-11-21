import type { MonthlyWin } from '@/features/perk-hunters/schemas';
import { perkWord } from '@/features/perk-hunters/format';
import * as Clipboard from 'expo-clipboard';
import Constants from 'expo-constants';
import * as Sharing from 'expo-sharing';
import { Linking, Platform, Share } from 'react-native';

export type StoryTarget = 'instagram' | 'whatsapp' | 'more';

export function winShareText(win: Pick<MonthlyWin, 'monthName' | 'year' | 'perks' | 'prize'>) {
  const prize = win.prize
    ? ` The prize is ${win.prize.title} at ${win.prize.partner}, ${win.prize.area}.`
    : '';
  return `I topped ${win.monthName} ${win.year} on Hunt with ${win.perks} ${perkWord(win.perks)} redeemed.${prize} Presented by Hunt.`;
}

export function socialLink(kind: 'whatsapp' | 'x' | 'telegram', text: string) {
  const encoded = encodeURIComponent(text);
  if (kind === 'whatsapp') return `https://wa.me/?text=${encoded}`;
  if (kind === 'x') return `https://twitter.com/intent/tweet?text=${encoded}`;
  return `https://t.me/share/url?text=${encoded}`;
}

export async function openSocialLink(url: string) {
  await Linking.openURL(url);
}

export async function shareWithSheet(text: string): Promise<'shared' | 'dismissed' | 'copied'> {
  if (Platform.OS === 'web') {
    const nav = typeof navigator !== 'undefined' ? navigator : undefined;
    if (nav && typeof nav.share === 'function') {
      try {
        await nav.share({ title: 'My Hunt win', text });
        return 'shared';
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') return 'dismissed';
      }
    }
    await Clipboard.setStringAsync(text);
    return 'copied';
  }

  try {
    const result = await Share.share({ message: text, title: 'My Hunt win' });
    if (result.action === Share.dismissedAction) return 'dismissed';
    return 'shared';
  } catch {
    await Clipboard.setStringAsync(text);
    return 'copied';
  }
}

export async function copyShareText(text: string) {
  await Clipboard.setStringAsync(text);
}

export async function shareStoryCard(uri: string, target: StoryTarget, message: string): Promise<'shared' | 'dismissed'> {
  const file = uri.startsWith('file://') || uri.startsWith('data:') ? uri : `file://${uri}`;
  if (Platform.OS === 'web') {
    const result = await shareWithSheet(message);
    return result === 'dismissed' ? 'dismissed' : 'shared';
  }

  try {
    const shared = await import('react-native-share');
    const sheet = shared.default;
    const { Social } = shared;
    if (target === 'whatsapp') {
      await sheet.shareSingle({
        social: Social.Whatsapp,
        url: file,
        type: 'image/png',
        message,
        filename: 'hunt-win.png',
      });
      return 'shared';
    }
    if (target === 'instagram') {
      const appId = facebookAppId();
      if (appId && Platform.OS === 'ios') {
        await sheet.shareSingle({
          social: Social.InstagramStories,
          appId,
          backgroundImage: file,
          backgroundTopColor: '#FC6401',
          backgroundBottomColor: '#F5F1E8',
        });
        return 'shared';
      }
      await sheet.shareSingle({
        social: Social.Instagram,
        url: file,
        type: 'image/png',
        message,
      });
      return 'shared';
    }
    const opened = await sheet.open({
      url: file,
      type: 'image/png',
      message,
      filename: 'hunt-win.png',
      failOnCancel: false,
      title: 'Share my win',
    });
    return opened.dismissedAction ? 'dismissed' : 'shared';
  } catch (error) {
    if (wasDismissed(error)) return 'dismissed';
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file, {
        mimeType: 'image/png',
        UTI: 'public.png',
        dialogTitle: 'Share my win',
      });
      return 'shared';
    }
    throw error;
  }
}

function facebookAppId() {
  const extra = Constants.expoConfig?.extra;
  if (!extra || typeof extra !== 'object' || !('facebookAppId' in extra)) return '';
  const value = extra.facebookAppId;
  return typeof value === 'string' ? value.trim() : '';
}

function wasDismissed(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  return /did not share|cancel|dismiss/i.test(message);
}
