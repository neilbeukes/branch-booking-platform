import type { ConfirmationPayload } from "../../../types";
import { AddToCalendar } from "../../../components/AddToCalendar";
import { BookingDetail } from "../../../components/BookingDetail";
import { Button } from "../../../components/Button";

interface ConfirmationStepProps {
  data: ConfirmationPayload;
  onNewBooking: () => void;
}

export function ConfirmationStep({
  data,
  onNewBooking,
}: ConfirmationStepProps) {
  const manageBookingUrl =
    typeof window !== "undefined" && data.customerEmail
      ? `${window.location.origin}/manage?reference=${encodeURIComponent(data.confirmationReference)}&email=${encodeURIComponent(data.customerEmail)}`
      : undefined;

  const calendarEvent = {
    title: `Capitec appointment – ${data.branch}`,
    description: `Reference: ${data.confirmationReference}. ${data.customerName}.`,
    location: [data.branch, data.branchAddress].filter(Boolean).join(", "),
    start: data.bookingTime,
    durationMinutes: data.durationMinutes,
    manageBookingUrl,
  };

  return (
    <div className="space-y-6 p-6 rounded-lg border border-gray-200 bg-white">
      <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
        This is a simulated confirmation. No SMS or email has been sent.
      </p>
      <BookingDetail data={data}>
        <AddToCalendar
          event={calendarEvent}
          className="pt-2 border-t border-gray-100"
        />
        <Button variant="primary" onClick={onNewBooking} className="mt-4">
          Book another appointment
        </Button>
      </BookingDetail>
    </div>
  );
}
