/** Month grid maths for the Calendar app. Weeks start on Monday, as in Turkey. */

export const GRID_DAYS = 42;

/** Monday-first index of a weekday: Mon = 0 ... Sun = 6. */
export const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

/** The 6×7 days shown for a month, starting on the Monday on or before the 1st. */
export function monthGrid(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - mondayIndex(first));
  return Array.from({ length: GRID_DAYS }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

/** Year/month after moving `delta` months, wrapping across years. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

/** "Pzt" ... "Paz", from Intl so it follows the locale. */
export const weekdayLabels = (locale = "tr-TR") =>
  monthGrid(2024, 0)
    .slice(0, 7)
    .map(d => d.toLocaleDateString(locale, { weekday: "short" }));

/** Sort key so all-day events come first, then by time. */
export const byTime = (a: { time: string }, b: { time: string }) => a.time.localeCompare(b.time);
