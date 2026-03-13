import { useSearchParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { appointments } from "../../api/client";
import type { BookingListItem } from "../../types";
import { BookingDetail } from "../../components/BookingDetail";
import { AddToCalendar } from "../../components/AddToCalendar";
import { Button } from "../../components/Button";
import { FaArrowLeft } from "react-icons/fa";
import { useConfirmationModal } from "../../contexts/ConfirmationModalContext/ConfirmationModalContext";
import { ManageBookingLookupForm } from "./components/ManageBookingLookupForm";

const manageBookingQueryKey = (ref: string, email: string) =>
  ["manage-booking", ref, email] as const;

export function ManageBooking() {
  const { confirm } = useConfirmationModal();
  const [searchParams, setSearchParams] = useSearchParams();
  const refFromUrl = searchParams.get("reference")?.trim() ?? "";
  const emailFromUrl = searchParams.get("email")?.trim() ?? "";
  const queryClient = useQueryClient();

  const {
    data: booking,
    isLoading,
    error,
  } = useQuery({
    queryKey: manageBookingQueryKey(refFromUrl, emailFromUrl),
    queryFn: () =>
      appointments.getByReferenceAndEmail(refFromUrl, emailFromUrl),
    enabled: Boolean(refFromUrl && emailFromUrl),
  });

  const cancelMutation = useMutation({
    mutationFn: ({
      ref,
      email,
    }: {
      ref: string;
      email: string;
    }) => appointments.cancel(ref, email),
    onSuccess: (_, { ref, email }) => {
      queryClient.setQueryData<BookingListItem>(
        manageBookingQueryKey(ref, email),
        (prev) =>
          prev ? { ...prev, status: "cancelled" as const } : prev,
      );
    },
  });

  const handleLookupSubmit = (ref: string, email: string) => {
    setSearchParams({ reference: ref, email });
  };

  const handleCancel = async () => {
    if (!booking || !emailFromUrl || booking.status === "cancelled") return;
    const confirmed = await confirm({
      title: "Cancel booking",
      message:
        "Are you sure you want to cancel this booking? This cannot be undone.",
      confirmLabel: "Cancel",
      cancelLabel: "Keep",
      variant: "danger",
    });
    if (!confirmed) return;
    cancelMutation.mutate({
      ref: booking.confirmationReference,
      email: emailFromUrl,
    });
  };

  const isCancelled = booking?.status === "cancelled";

  return (
    <div className="space-y-4">
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition no-underline"
      >
        <FaArrowLeft className="w-4 h-4" /> Back
      </Link>
      <h2 className="text-lg font-semibold text-gray-800">Manage my booking</h2>

      {!refFromUrl || !emailFromUrl ? (
        <ManageBookingLookupForm
          onSubmit={handleLookupSubmit}
          loading={false}
          error={null}
        />
      ) : (
        <>
          {isLoading && <p className="text-gray-500">Loading…</p>}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error instanceof Error ? error.message : "Failed to load booking"}
            </p>
          )}
          {booking && !isLoading && (
            <div className="p-6 rounded-lg border border-gray-200 bg-white">
              <BookingDetail
                data={{
                  confirmationReference: booking.confirmationReference,
                  branch: booking.branch,
                  branchAddress: booking.branchAddress,
                  bookingTime: booking.bookingTime,
                  durationMinutes: booking.durationMinutes,
                  customerName: booking.customerName,
                  customerEmail: booking.customerEmail,
                  status: booking.status,
                }}
              >
                {!isCancelled && (
                  <>
                    <AddToCalendar
                      event={{
                        title: `Capitec appointment – ${booking.branch}`,
                        description: `Reference: ${booking.confirmationReference}. ${booking.customerName}.`,
                        location: [booking.branch, booking.branchAddress]
                          .filter(Boolean)
                          .join(", "),
                        start: booking.bookingTime,
                        durationMinutes: booking.durationMinutes,
                        manageBookingUrl:
                          typeof window !== "undefined" && emailFromUrl
                            ? `${window.location.origin}/manage?reference=${encodeURIComponent(booking.confirmationReference)}&email=${encodeURIComponent(emailFromUrl)}`
                            : undefined,
                      }}
                      className="pt-4 border-t border-gray-100"
                    />
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                      <Button
                        variant="primary"
                        onClick={handleCancel}
                        disabled={cancelMutation.isPending}
                      >
                        {cancelMutation.isPending
                          ? "Cancelling…"
                          : "Cancel booking"}
                      </Button>
                      <Link
                        to={`/?edit=${encodeURIComponent(booking.confirmationReference)}&email=${encodeURIComponent(emailFromUrl)}`}
                      >
                        <Button variant="secondary">Edit / reschedule</Button>
                      </Link>
                    </div>
                  </>
                )}
                {isCancelled && (
                  <p className="pt-4 border-t border-gray-100 text-sm text-amber-700">
                    This booking has been cancelled.
                  </p>
                )}
              </BookingDetail>
            </div>
          )}
          {cancelMutation.isError && (
            <p className="text-sm text-red-600" role="alert">
              {cancelMutation.error instanceof Error
                ? cancelMutation.error.message
                : "Failed to cancel"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
