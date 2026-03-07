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
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/** Format a Date as YYYY-MM-DD for API responses and queries */
export function formatDateToYMD(d: Date): string {
  return format(d, 'yyyy-MM-dd');
}

/** Parse YYYY-MM-DD as local midnight. Avoid parseISO for date-only strings (it uses UTC and can shift the day). */
export function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Interpret dateStr (YYYY-MM-DD) + timeStr (HH:mm) in the given IANA timezone; return UTC Date. */
export function localDateAndTimeToUTC(dateStr: string, timeStr: string, timezone: string): Date {
  const [h, min] = timeStr.split(':').map(Number);
  const timePart = `${String(h ?? 0).padStart(2, '0')}:${String(min ?? 0).padStart(2, '0')}:00`;
  const dateTimeStr = `${dateStr} ${timePart}`;
  return fromZonedTime(dateTimeStr, timezone);
}

/** Return calendar date YYYY-MM-DD for the given UTC Date in the given timezone. */
export function utcToLocalYMD(utcDate: Date, timezone: string): string {
  const zoned = toZonedTime(utcDate, timezone);
  return format(zoned, 'yyyy-MM-dd');
}

/** Return time HH:mm for the given UTC Date in the given timezone. */
export function utcToLocalTime(utcDate: Date, timezone: string): string {
  const zoned = toZonedTime(utcDate, timezone);
  return format(zoned, 'HH:mm');
}

/** Given a calendar date (YYYY-MM-DD) in the given timezone, return UTC range [start, end) for that full day. */
export function localDateToUTCRange(dateStr: string, timezone: string): { start: Date; end: Date } {
  const start = fromZonedTime(`${dateStr} 00:00:00`, timezone);
  const [y, m, d] = dateStr.split('-').map(Number);
  const nextDay = new Date(y!, m! - 1, d! + 1);
  const nextStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, '0')}-${String(nextDay.getDate()).padStart(2, '0')}`;
  const end = fromZonedTime(`${nextStr} 00:00:00`, timezone);
  return { start, end };
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

/** Today's date string (YYYY-MM-DD) in the given timezone */
export function todayInTimezone(timezone: string): string {
  return utcToLocalYMD(new Date(), timezone);
}
