export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Разница в календарных днях (не в часах) между двумя моментами. */
export function dayDiff(from: number, to: number): number {
  const a = startOfDay(new Date(from)).getTime();
  const b = startOfDay(new Date(to)).getTime();
  return Math.round((b - a) / 86_400_000);
}

export function isOverdue(dueAt: number | null, now = Date.now()): boolean {
  if (dueAt === null) return false;
  return dayDiff(now, dueAt) < 0;
}

export function formatShortDate(ts: number, locale: string): string {
  return new Date(ts).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}
