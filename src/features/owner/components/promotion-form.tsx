import { Chip } from '@/components/ui/chip';
import { Body, Label } from '@/components/ui/typography';
import { TextField } from '@/features/auth/components/text-field';
import { BigNumberInput, FormFooter } from '@/features/owner/components/form-parts';
import { ImageField } from '@/features/owner/components/image-field';
import { WhenRange } from '@/features/owner/components/when-range';
import { useSavePromotion } from '@/features/owner/hooks';
import {
  promotionFormSchema,
  type OwnerPromotion,
  type OwnerVenue,
  type PromotionFormValues,
} from '@/features/owner/schemas';
import { getApiErrorMessage } from '@/lib/api-error';
import { defaultOfferWindow } from '@/lib/dates';
import { useSurfaces } from '@/theme/surfaces';
import { zodResolver } from '@hookform/resolvers/zod';
import { Info } from 'lucide-react-native';
import { useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';

type PromotionFormProps = {
  promotion?: OwnerPromotion | null;
  venues: OwnerVenue[];
  onSaved: (promotion: OwnerPromotion) => void;
};

export function PromotionForm({ promotion, venues, onSaved }: PromotionFormProps) {
  const { colors } = useSurfaces();
  const save = useSavePromotion(promotion?.id);
  const [formError, setFormError] = useState<string | null>(null);
  const opening = defaultOfferWindow();
  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: {
      venueId: promotion?.venueId ?? venues[0]?.id ?? '',
      title: promotion?.title ?? '',
      description: promotion?.description ?? '',
      imageUrl: promotion?.imageUrl ?? '',
      startsAt: promotion?.startsAt ?? opening.startsAt,
      endsAt: promotion?.endsAt ?? opening.endsAt,
      discountPercent: promotion?.discountPercent ?? 10,
    },
  });
  const venueId = useWatch({ control: form.control, name: 'venueId' });
  const venueName = promotion?.venue?.name ?? venues.find((venue) => venue.id === venueId)?.name ?? 'your place';

  const onSubmit = form.handleSubmit(async (values) => {
    setFormError(null);
    if (!promotion && new Date(values.endsAt).getTime() <= Date.now()) {
      setFormError('This window has already finished.');
      return;
    }
    try {
      onSaved(await save.mutateAsync(values));
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Could not save this promotion.'));
    }
  });

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      <ScrollView
        style={{ flex: 1 }}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ gap: 26, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 }}>
        <Controller
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <ImageField
              url={field.value}
              onChange={field.onChange}
              squarePixels={1248}
              hint="Square photo, 1248 × 1248. Optional, but offers with a photo get noticed."
            />
          )}
        />
        <View style={{ gap: 8 }}>
          <Label>For</Label>
          {promotion ? (
            <View style={{ flexDirection: 'row' }}>
              <Chip label={promotion.venue?.name ?? 'This place'} selected />
            </View>
          ) : (
            <Controller
              control={form.control}
              name="venueId"
              render={({ field, fieldState }) => (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {venues.map((venue) => (
                      <Chip
                        key={venue.id}
                        label={venue.name}
                        selected={field.value === venue.id}
                        onPress={() => field.onChange(venue.id)}
                      />
                    ))}
                  </View>
                  {fieldState.error ? (
                    <Body size={13} color={colors.danger}>
                      {fieldState.error.message}
                    </Body>
                  ) : null}
                </View>
              )}
            />
          )}
        </View>
        <Controller
          control={form.control}
          name="title"
          render={({ field, fieldState }) => (
            <TextField
              label="Headline"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
              placeholder="Sunset happy hour"
              autoCapitalize="sentences"
              displaySize={22}
            />
          )}
        />
        <Controller
          control={form.control}
          name="description"
          render={({ field }) => (
            <TextField
              label="The details"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Half price drinks from 5 to 7, every weekday."
              autoCapitalize="sentences"
              multiline
            />
          )}
        />
        <Controller
          control={form.control}
          name="discountPercent"
          render={({ field, fieldState }) => (
            <View style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row' }}>
                <BigNumberInput
                  label="Off"
                  unit="%"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={fieldState.error?.message}
                />
              </View>
              <Body size={13} color={colors.mute}>
                Guests see this percentage on your shop’s pin while the offer is open.
              </Body>
            </View>
          )}
        />
        <Controller
          control={form.control}
          name="startsAt"
          render={({ field: startField }) => (
            <Controller
              control={form.control}
              name="endsAt"
              render={({ field: endField, fieldState }) => (
                <WhenRange
                  startsAt={startField.value}
                  endsAt={endField.value}
                  error={fieldState.error?.message}
                  onChange={({ startsAt, endsAt }) => {
                    startField.onChange(startsAt);
                    endField.onChange(endsAt);
                  }}
                />
              )}
            />
          )}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Info color={colors.mute} size={16} strokeWidth={1.8} style={{ marginTop: 1 }} />
          <Body size={13} color={colors.mute} style={{ flex: 1 }}>
            {`Guests see this on ${venueName}’s page and in Offers only while this window is open.`}
          </Body>
        </View>
      </ScrollView>
      <FormFooter
        label={promotion ? 'Save offer' : 'Post offer'}
        onPress={() => void onSubmit()}
        loading={save.isPending}
        error={formError}
      />
    </KeyboardAvoidingView>
  );
}
