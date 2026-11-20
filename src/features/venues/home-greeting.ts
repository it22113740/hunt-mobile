// Time-based home greeting. Tap the heading to pass a higher `shuffle`.

export type Line = [before: string, highlight: string, after: string];

export interface Slot {
  lines: Line[];
  notes: string[];
  icon: string;
  searchHints: string[];
  chips: string[];
}

export interface HomeGreeting {
  greeting: { before: string; highlight: string; after: string };
  note: string;
  icon: string;
  searchHints: string[];
  chips: string[];
}

// Hours are local time. 23–29 means 11pm to 5am.
const SLOTS: (Slot & { from: number; to: number })[] = [
  {
    from: 5,
    to: 8,
    icon: 'sunrise',
    lines: [
      ['Rise and ', 'roam', ', {name}.'],
      ['', 'வணக்கம்', ', {name}. Up early?'],
      ['Beat the ', 'crowd', ', {name}?'],
    ],
    notes: ['early bird, extra points', 'the city is all yours'],
    searchHints: ['a sunrise spot', 'fresh hoppers', 'a morning walk'],
    chips: ['Cafés', 'Parks', 'Bakeries'],
  },
  {
    from: 8,
    to: 11,
    icon: 'sun-high',
    lines: [
      ["Where's the ", 'first stop', ', {name}?'],
      ['Fresh day, fresh ', 'finds', '.'],
      ['Coffee or ', 'adventure', '?'],
    ],
    notes: ['{newSpots} new spots near you', 'your streak: {streak} days'],
    searchHints: ['a quiet café', 'a bookshop', 'somewhere new'],
    chips: ['Cafés', 'Shops', 'Sights'],
  },
  {
    from: 11,
    to: 14,
    icon: 'sun',
    lines: [
      ['Lunch break ', 'detour', ', {name}?'],
      ['Hungry for ', 'something new', '?'],
      ['Out and ', 'about', ', {name}?'],
    ],
    notes: ['{deals} lunch deals nearby', 'go on, explore a bit'],
    searchHints: ['a spot for lunch', 'a shop nearby', 'somewhere with AC'],
    chips: ['Food', 'Shops', 'Services'],
  },
  {
    from: 14,
    to: 17,
    icon: 'coffee',
    lines: [
      ['Tea time ', 'wander', ', {name}?'],
      ['Beat the ', 'heat', ' somewhere cool?'],
      ['Afternoon ', 'slump', "? Let's fix that."],
    ],
    notes: ['plain tea and vadai?', '{challenges} challenges waiting'],
    searchHints: ['plain tea and vadai', 'a cool hangout', 'a beach drive'],
    chips: ['Tea shops', 'Malls', 'Beaches'],
  },
  {
    from: 17,
    to: 20,
    icon: 'sunset-2',
    lines: [
      ['', 'Golden hour', ', {name}. Where to?'],
      ['Sunset ', 'plans', ', {name}?'],
      ['Clocked out? Time to ', 'explore', '.'],
    ],
    notes: ['sunset at the fort?', 'perfect photo light'],
    searchHints: ['sunset at the fort', 'street food', 'a gym nearby'],
    chips: ['Sights', 'Food', 'Fitness'],
  },
  {
    from: 20,
    to: 23,
    icon: 'moon-stars',
    lines: [
      ['Where to ', 'tonight', ', {name}?'],
      ['The night is ', 'young', ', {name}.'],
      ['One more ', 'hunt', ' before bed?'],
    ],
    notes: ['{openLate} spots open till late', 'night challenge is live'],
    searchHints: ['kottu nearby', 'a rooftop', 'live music'],
    chips: ['Food', 'Events', 'Hangouts'],
  },
  {
    from: 23,
    to: 29,
    icon: 'moon',
    lines: [
      ['Still ', 'hunting', ', {name}?'],
      ['Night owl ', 'mode', ' on.'],
      ["What's open ", 'late', '?'],
    ],
    notes: ['the city never sleeps', 'late-night spots only'],
    searchHints: ['something open late', 'a late-night kottu', 'a 24h pharmacy'],
    chips: ['Open now', 'Food', 'Pharmacy'],
  },
];

// Saturday/Sunday 7am–12pm overrides the copy (keeps that slot's chips).
const WEEKEND_MORNING: Omit<Slot, 'chips'> = {
  icon: 'confetti',
  lines: [
    ['No alarms. Just ', 'adventures', '.'],
    ['Weekend ', 'plans', ', {name}?'],
    ['Slow ', '{weekday}', ', {name}?'],
  ],
  notes: ['weekend challenges are live', 'sleep in, then explore'],
  searchHints: ['a weekend brunch', 'a day trip', 'a beach to chill'],
};

/** Live numbers from the backend. Notes that need a missing number are skipped. */
export interface Stats {
  newSpots?: number;
  streak?: number;
  deals?: number;
  challenges?: number;
  openLate?: number;
}

export function getHomeGreeting(name: string, now: Date = new Date(), shuffle = 0, stats: Stats = {}): HomeGreeting {
  const h = now.getHours();
  const day = now.getDay();
  const hour = h < 5 ? h + 24 : h;
  const base = SLOTS.find((slot) => hour >= slot.from && hour < slot.to) ?? SLOTS[0];
  const isWeekendMorning = (day === 0 || day === 6) && h >= 7 && h < 12;
  const slot: Slot = isWeekendMorning ? { ...WEEKEND_MORNING, chips: base.chips } : base;

  // Same greeting all day (no flicker), new one each day, tap to shuffle.
  const seed = now.getFullYear() * 400 + now.getMonth() * 31 + now.getDate() + shuffle;

  const first = name.trim().split(/\s+/)[0] || 'there';
  const vars: Record<string, string> = {
    name: first,
    weekday: day === 6 ? 'Saturday' : 'Sunday',
    ...Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, String(value)])),
  };
  const fill = (value: string) => value.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);

  const [before, highlight, after] = slot.lines[seed % slot.lines.length].map(fill) as Line;
  const notes = slot.notes.map(fill).filter((note) => !note.includes('{'));
  const note = notes.length ? notes[seed % notes.length] : '';

  return {
    greeting: { before, highlight, after },
    note,
    icon: slot.icon,
    searchHints: slot.searchHints,
    chips: slot.chips,
  };
}
