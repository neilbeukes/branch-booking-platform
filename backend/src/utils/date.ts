import {
  format,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMinutes,
  setHours,
  setMinutes,
  isBefore,
  eachDayOfInterval,
} from 'date-fns';

/** Format a Date as YYYY-MM-DD for API responses and queries */
export function formatDateToYMD(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** Parse YYYY-MM-DD as local midnight. Avoid parseISO for date-only strings (it uses UTC and can shift the day). */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  console.log("🚀 ~ parseDateString ~ d:", d)
  console.log("🚀 ~ parseDateString ~ new Date(y, m - 1, d, 0, 0, 0, 0):", new Date(y, m - 1, d, 0, 0, 0, 0))
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Add minutes to a time string "HH:mm". Returns "HH:mm". */
export function addMinutesToTime(timeStr: string, minutes: number): string {
  const [h, m] = timeStr.split(':').map(Number);
  const ref = setMinutes(setHours(new Date(0), h ?? 0), m ?? 0);
  return format(addMinutes(ref, minutes), 'HH:mm');
}

/** First day of the given year/month (1-indexed) at start of day */
export function startOfMonthAt(y: number, month: number): Date {
  return startOfMonth(new Date(y, month - 1, 1));
}

/** Last day of the given year/month (1-indexed) at end of day */
export function endOfMonthAt(y: number, month: number): Date {
  return endOfMonth(new Date(y, month - 1, 1));
}

/** All dates in the interval [start, end] that are not before today */
export function daysInRangeNotBeforeToday(start: Date, end: Date): Date[] {
  const today = startOfDay(new Date());
  return eachDayOfInterval({ start, end }).filter((d) => !isBefore(d, today));
}
