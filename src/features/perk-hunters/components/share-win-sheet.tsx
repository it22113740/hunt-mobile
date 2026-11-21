import { showToast } from '@/components/toast';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { hapticLight } from '@/components/ui/press';
import { Sub } from '@/components/ui/typography';
import { WinStoryCard } from '@/features/perk-hunters/components/win-story-card';
import { copyShareText, shareStoryCard, winShareText, type StoryTarget } from '@/features/perk-hunters/share';
import type { MonthlyWin } from '@/features/perk-hunters/schemas';
import { useRef, useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

type ShareWinSheetProps = {
  win: MonthlyWin | null;
  onClose: () => void;
};

export function ShareWinSheet({ win, onClose }: ShareWinSheetProps) {
  const { width, height } = useWindowDimensions();
  const cardRef = useRef<ViewShotRef>(null);
  const [busy, setBusy] = useState<StoryTarget | 'copy' | null>(null);
  const cardWidth = Math.min(320, width - 40, height * 0.42);
  const text = win ? winShareText(win) : '';

  const share = async (target: StoryTarget) => {
    const shot = cardRef.current;
    if (!win || !shot || busy) return;
    hapticLight();
    setBusy(target);
    try {
      const uri = await shot.capture();
      const result = await shareStoryCard(uri, target, text);
      if (result !== 'dismissed') onClose();
    } catch {
      showToast('Couldn’t share that story. Try again.');
    } finally {
      setBusy(null);
    }
  };

  const copy = async () => {
    if (!win || busy) return;
    hapticLight();
    setBusy('copy');
    await copyShareText(text);
    showToast('Message copied');
    setBusy(null);
    onClose();
  };

  return (
    <BottomSheet visible={Boolean(win)} onClose={onClose} accessibilityLabel="Share your win">
      {win ? (
        <ScrollView style={{ maxHeight: height * 0.46 }} contentContainerStyle={{ alignItems: 'center' }}>
          <ViewShot
            ref={cardRef}
            options={{ format: 'png', quality: 1, result: 'tmpfile', fileName: 'HuntWinStory', width: 1080, height: 1080 }}>
            <WinStoryCard win={win} width={cardWidth} />
          </ViewShot>
        </ScrollView>
      ) : null}
      <Sub size={14} style={{ marginTop: 12 }}>
        This card is built from the win. Instagram and WhatsApp get the picture. Other story apps are in the share sheet.
      </Sub>
      <View style={{ marginTop: 14, gap: 10 }}>
        <Button
          label="Instagram story"
          loading={busy === 'instagram'}
          disabled={Boolean(busy)}
          onPress={() => void share('instagram')}
        />
        <Button label="WhatsApp" loading={busy === 'whatsapp'} disabled={Boolean(busy)} onPress={() => void share('whatsapp')} />
        <Button
          label="Other stories"
          variant="secondary"
          loading={busy === 'more'}
          disabled={Boolean(busy)}
          onPress={() => void share('more')}
        />
        <Button label="Copy message" variant="secondary" disabled={Boolean(busy)} onPress={() => void copy()} />
      </View>
    </BottomSheet>
  );
}
