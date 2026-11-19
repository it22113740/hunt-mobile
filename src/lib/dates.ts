const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** `Sun 11 Oct` */
export function shortDate(date: Date) {
  return `${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

/** `Oct 7` */
export function monthDay(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

/** `12:26` (24-hour clock, as in the journal designs). */
export function clockTime(value: Date | string) {
  const date = typeof value === 'string' ? new Date(value) : value;
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export type OfferTiming = 'upcoming' | 'live' | 'ended';

export function offerTiming(startsAt: string, endsAt: string, now = new Date()): OfferTiming {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const time = now.getTime();
  if (time < start) return 'upcoming';
  if (time >= end) return 'ended';
  return 'live';
}

/** `Thu 19 Nov, 17:00–19:00`, or across days when the window spans them. */
export function offerWindowLine(startsAt: string, endsAt: string) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (start.toDateString() === end.toDateString()) {
    return `${shortDate(start)}, ${clockTime(start)}–${clockTime(end)}`;
  }
  return `${shortDate(start)} ${clockTime(start)} – ${shortDate(end)} ${clockTime(end)}`;
}

/** `Until 19:00` today, otherwise `Until Thu 19 Nov, 19:00`. */
export function untilLine(endsAt: string, now = new Date()) {
  const end = new Date(endsAt);
  if (end.toDateString() === now.toDateString()) return `Until ${clockTime(end)}`;
  return `Until ${shortDate(end)}, ${clockTime(end)}`;
}

/** Next hour, open for two hours. Used when an owner starts a new offer. */
export function defaultOfferWindow(now = new Date()) {
  const start = new Date(now);
  start.setMinutes(0, 0, 0);
  start.setHours(start.getHours() + 1);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

/** Keep the window valid when one side moves. The other side shifts by an hour if they would overlap. */
export function setOfferInstant(startsAt: string, endsAt: string, which: 'start' | 'end', picked: Date) {
  let start = which === 'start' ? picked : new Date(startsAt);
  let end = which === 'end' ? picked : new Date(endsAt);
  if (end.getTime() <= start.getTime()) {
    if (which === 'start') end = new Date(start.getTime() + 60 * 60 * 1000);
    else start = new Date(end.getTime() - 60 * 60 * 1000);
  }
  return { startsAt: start.toISOString(), endsAt: end.toISOString() };
}

export function applyOfferPart(
  startsAt: string,
  endsAt: string,
  which: 'start' | 'end',
  mode: 'date' | 'time',
  picked: Date,
) {
  const current = new Date(which === 'start' ? startsAt : endsAt);
  const next = new Date(current);
  if (mode === 'date') next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
  else next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
  return setOfferInstant(startsAt, endsAt, which, next);
}
