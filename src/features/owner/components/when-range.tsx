import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Body, Label, Mono } from '@/components/ui/typography';
import { applyOfferPart, clockTime, offerTiming, shortDate } from '@/lib/dates';
import { useSurfaces } from '@/theme/surfaces';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';

type Which = 'start' | 'end';
type Mode = 'date' | 'time';

type WhenRangeProps = {
  startsAt: string;
  endsAt: string;
  onChange: (next: { startsAt: string; endsAt: string }) => void;
  error?: string;
};

export function WhenRange({ startsAt, endsAt, onChange, error }: WhenRangeProps) {
  const { colors, isJournal } = useSurfaces();
  const [picking, setPicking] = useState<{ which: Which; mode: Mode } | null>(null);
  const [draft, setDraft] = useState<Date | null>(null);
  const timing = offerTiming(startsAt, endsAt);
  const status = timing === 'live' ? 'On now' : timing === 'upcoming' ? 'Starts later' : 'Already finished';
  const statusColor = timing === 'ended' ? colors.danger : timing === 'live' ? colors.good : colors.mute;

  const commit = (which: Which, mode: Mode, picked: Date) => {
    onChange(applyOfferPart(startsAt, endsAt, which, mode, picked));
  };

  const open = (which: Which, mode: Mode) => {
    setPicking({ which, mode });
    setDraft(new Date(which === 'end' ? endsAt : startsAt));
  };

  const close = () => {
    setPicking(null);
    setDraft(null);
  };

  const onPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    if (!picking) return;
    if (Platform.OS === 'android') {
      const target = picking;
      close();
      if (event.type !== 'set' || !selected) return;
      commit(target.which, target.mode, selected);
      return;
    }
    if (selected) setDraft(selected);
  };

  const pickerValue = draft ?? new Date(picking?.which === 'end' ? endsAt : startsAt);

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Label>When</Label>
        <Mono size={12} color={statusColor}>
          {status}
        </Mono>
      </View>
      <WhenRow
        label="Starts"
        value={startsAt}
        onDate={() => open('start', 'date')}
        onTime={() => open('start', 'time')}
      />
      <WhenRow
        label="Ends"
        value={endsAt}
        onDate={() => open('end', 'date')}
        onTime={() => open('end', 'time')}
      />
      {error ? (
        <Body size={13} color={colors.danger}>
          {error}
        </Body>
      ) : null}
      {picking && Platform.OS === 'android' ? (
        <DateTimePicker value={pickerValue} mode={picking.mode} onChange={onPickerChange} />
      ) : null}
      {Platform.OS === 'ios' ? (
        <BottomSheet
          visible={Boolean(picking)}
          onClose={close}
          accessibilityLabel={picking ? `${picking.which === 'start' ? 'Starts' : 'Ends'} ${picking.mode}` : undefined}>
          {picking ? (
            <View style={{ gap: 16 }}>
              <Label>{`${picking.which === 'start' ? 'Starts' : 'Ends'} · ${picking.mode}`}</Label>
              <DateTimePicker
                value={pickerValue}
                mode={picking.mode}
                display="spinner"
                themeVariant={isJournal ? 'light' : undefined}
                textColor={colors.ink}
                onChange={onPickerChange}
                style={{ height: 216 }}
              />
              <Button
                label="Use this time"
                onPress={() => {
                  if (draft) commit(picking.which, picking.mode, draft);
                  close();
                }}
              />
            </View>
          ) : null}
        </BottomSheet>
      ) : null}
    </View>
  );
}

function WhenRow({
  label,
  value,
  onDate,
  onTime,
}: {
  label: string;
  value: string;
  onDate: () => void;
  onTime: () => void;
}) {
  const { colors, isJournal } = useSurfaces();
  const date = new Date(value);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        paddingVertical: 12,
        borderBottomWidth: isJournal ? 1.5 : 1,
        borderBottomColor: isJournal ? colors.ink : colors.lineStrong,
      }}>
      <Label>{label}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} date`} hitSlop={8} onPress={onDate}>
          <Body size={16} weight="semibold">
            {shortDate(date)}
          </Body>
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel={`${label} time`} hitSlop={8} onPress={onTime}>
          <Mono size={16} color={colors.ink}>
            {clockTime(date)}
          </Mono>
        </Pressable>
      </View>
    </View>
  );
}
