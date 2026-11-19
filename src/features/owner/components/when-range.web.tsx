import { Body, Label, Mono } from '@/components/ui/typography';
import { offerTiming, setOfferInstant } from '@/lib/dates';
import { useSurfaces } from '@/theme/surfaces';
import { createElement } from 'react';
import { View } from 'react-native';

type Which = 'start' | 'end';

type WhenRangeProps = {
  startsAt: string;
  endsAt: string;
  onChange: (next: { startsAt: string; endsAt: string }) => void;
  error?: string;
};

export function WhenRange({ startsAt, endsAt, onChange, error }: WhenRangeProps) {
  const { colors } = useSurfaces();
  const timing = offerTiming(startsAt, endsAt);
  const status = timing === 'live' ? 'On now' : timing === 'upcoming' ? 'Starts later' : 'Already finished';
  const statusColor = timing === 'ended' ? colors.danger : timing === 'live' ? colors.good : colors.mute;

  const set = (which: Which, value: string) => {
    if (!value) return;
    onChange(setOfferInstant(startsAt, endsAt, which, new Date(value)));
  };

  return (
    <View style={{ gap: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Label>When</Label>
        <Mono size={12} color={statusColor}>
          {status}
        </Mono>
      </View>
      <WebWhenRow label="Starts" value={startsAt} onChange={(value) => set('start', value)} />
      <WebWhenRow label="Ends" value={endsAt} onChange={(value) => set('end', value)} />
      {error ? (
        <Body size={13} color={colors.danger}>
          {error}
        </Body>
      ) : null}
    </View>
  );
}

function WebWhenRow({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const { colors, isJournal } = useSurfaces();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        borderBottomWidth: isJournal ? 1.5 : 1,
        borderBottomColor: isJournal ? colors.ink : colors.lineStrong,
      }}>
      <Label>{label}</Label>
      {createElement('input', {
        type: 'datetime-local',
        value: toLocalInput(value),
        'aria-label': `${label} date and time`,
        onChange: (event: { target: { value: string } }) => onChange(event.target.value),
        style: {
          border: 'none',
          background: 'transparent',
          color: colors.ink,
          fontFamily: 'IBMPlexMono_500Medium, monospace',
          fontSize: 16,
          padding: '12px 0',
          textAlign: 'right',
        },
      })}
    </View>
  );
}

function toLocalInput(iso: string) {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
