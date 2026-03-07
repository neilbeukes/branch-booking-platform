/**
 * Format bookingTime (UTC ISO) + durationMinutes for display in user's local timezone.
 */
export function formatBookingDisplay(
  bookingTime: string,
  durationMinutes: number
): { date: string; time: string; endTime: string } {
  const start = new Date(bookingTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const date = start.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' });
  const time = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const endTime = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  return { date, time, endTime };
}
