import { BookingListItem, Slot } from "../types";

// Format bookingTime (UTC ISO) + durationMinutes for display in user's local timezone.
export function formatBookingDisplay(
  bookingTime: string,
  durationMinutes: number,
): { date: string; time: string; endTime: string } {
  const start = new Date(bookingTime);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const date = start.toLocaleDateString(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const time = start.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endTime = end.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return { date, time, endTime };
}

// Convert bookingTime and durationMinutes to date and slot
export function dateAndSlotFromBooking(
  booking: BookingListItem,
): { date: string; slot: Slot } | null {
  if (!booking.bookingTime || booking.durationMinutes == null) return null;
  const start = new Date(booking.bookingTime);
  const end = new Date(start.getTime() + booking.durationMinutes * 60 * 1000);
  const date = `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}-${String(start.getDate()).padStart(2, "0")}`;
  const startTime = `${String(start.getHours()).padStart(2, "0")}:${String(start.getMinutes()).padStart(2, "0")}`;
  const endTime = `${String(end.getHours()).padStart(2, "0")}:${String(end.getMinutes()).padStart(2, "0")}`;
  return { date, slot: { startTime, endTime } };
}
