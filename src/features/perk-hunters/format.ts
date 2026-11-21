export function formatCount(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function endsInLabel(endsAt: string, now = new Date()) {
  const remaining = new Date(endsAt).getTime() - now.getTime();
  if (remaining <= 0) return '0h';
  const hours = Math.floor(remaining / 3_600_000);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h`;
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  return `${hours}h ${minutes}m`;
}

export function perkWord(count: number) {
  return count === 1 ? 'perk' : 'perks';
}
