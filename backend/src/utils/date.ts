import { format } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";

// Interpret dateStr (YYYY-MM-DD) + timeStr (HH:mm) in the given timezone; return UTC Date.
export function localDateAndTimeToUTC(
  dateStr: string,
  timeStr: string,
  timezone: string,
): Date {
  const [h, min] = timeStr.split(":").map(Number);
  const timePart = `${String(h ?? 0).padStart(2, "0")}:${String(min ?? 0).padStart(2, "0")}:00`;
  const dateTimeStr = `${dateStr} ${timePart}`;
  return fromZonedTime(dateTimeStr, timezone);
}

// Return calendar date YYYY-MM-DD for the given UTC Date in the given timezone.
export function utcToLocalYMD(utcDate: Date, timezone: string): string {
  const zoned = toZonedTime(utcDate, timezone);
  return format(zoned, "yyyy-MM-dd");
}

// Return time HH:mm for the given UTC Date in the given timezone.
export function utcToLocalTime(utcDate: Date, timezone: string): string {
  const zoned = toZonedTime(utcDate, timezone);
  return format(zoned, "HH:mm");
}

// Given a calendar date (YYYY-MM-DD) in the given timezone, return UTC range [start, end) for that full day.
export function localDateToUTCRange(
  dateStr: string,
  timezone: string,
): { start: Date; end: Date } {
  const start = fromZonedTime(`${dateStr} 00:00:00`, timezone);
  const [y, m, d] = dateStr.split("-").map(Number);
  const nextDay = new Date(y!, m! - 1, d! + 1);
  const nextStr = `${nextDay.getFullYear()}-${String(nextDay.getMonth() + 1).padStart(2, "0")}-${String(nextDay.getDate()).padStart(2, "0")}`;
  const end = fromZonedTime(`${nextStr} 00:00:00`, timezone);
  return { start, end };
}

// Today's date string (YYYY-MM-DD) in the given timezone
export function todayInTimezone(timezone: string): string {
  return utcToLocalYMD(new Date(), timezone);
}
