import { Body, H2, Sub } from '@/components/ui/typography';
import { FormFooter } from '@/features/owner/components/form-parts';
import { WhenRange } from '@/features/owner/components/when-range';
import { useSetPromotionActive } from '@/features/owner/hooks';
import type { OwnerPromotion } from '@/features/owner/schemas';
import { getApiErrorMessage } from '@/lib/api-error';
import { defaultOfferWindow } from '@/lib/dates';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

type TurnOnOfferProps = {
  promotion: OwnerPromotion;
  onSaved: () => void;
};

export function TurnOnOffer({ promotion, onSaved }: TurnOnOfferProps) {
  const opening = defaultOfferWindow();
  const [startsAt, setStartsAt] = useState(opening.startsAt);
  const [endsAt, setEndsAt] = useState(opening.endsAt);
  const [error, setError] = useState<string | null>(null);
  const turnOn = useSetPromotionActive();

  const submit = async () => {
    if (new Date(endsAt).getTime() <= new Date(startsAt).getTime()) {
      setError('The end has to be after the start.');
      return;
    }
    if (new Date(endsAt).getTime() <= Date.now()) {
      setError('This window has already finished.');
      return;
    }
    const sameStart = new Date(startsAt).getTime() === new Date(promotion.startsAt).getTime();
    const sameEnd = new Date(endsAt).getTime() === new Date(promotion.endsAt).getTime();
    if (sameStart && sameEnd) {
      setError('Choose a new time period.');
      return;
    }
    setError(null);
    try {
      await turnOn.mutateAsync({ id: promotion.id, active: true, startsAt, endsAt });
      onSaved();
    } catch (turnOnError) {
      setError(getApiErrorMessage(turnOnError, 'Could not turn this offer on.'));
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ gap: 22, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
        <View style={{ gap: 8 }}>
          <H2 size={24}>{promotion.title}</H2>
          <Sub>The previous time does not carry over. Choose when this offer runs next.</Sub>
        </View>
        <WhenRange
          startsAt={startsAt}
          endsAt={endsAt}
          onChange={(next) => {
            setStartsAt(next.startsAt);
            setEndsAt(next.endsAt);
            setError(null);
          }}
        />
        <Body size={14}>It turns off by itself when this time ends.</Body>
      </ScrollView>
      <FormFooter label="Turn on" onPress={() => void submit()} loading={turnOn.isPending} error={error} />
    </View>
  );
}
