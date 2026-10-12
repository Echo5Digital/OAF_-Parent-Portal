/** Parses "08:00 AM" style strings to minutes-since-midnight. Mirrors src/data/model.ts's parseTime on the frontend, re-validated here since the client value is never trusted for compliance math. */
export function parseTimeToMinutes(value: string | undefined): number | null {
  if (!value) return null;
  const m = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let hours = parseInt(m[1], 10) % 12;
  if (/pm/i.test(m[3])) hours += 12;
  return hours * 60 + parseInt(m[2], 10);
}
