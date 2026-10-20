/** Istanbul uses UTC+03:00; independent of the deployment server timezone. */
export function scopeSince(scope: 'today' | 'alltime', now = new Date()): string {
  if (scope === 'alltime') return '1970-01-01T00:00:00.000Z';
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(now);
  return new Date(`${date}T00:00:00+03:00`).toISOString();
}
