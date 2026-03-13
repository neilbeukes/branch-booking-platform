import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BookingFlow } from "./BookingStepperFlow";
import type { InitialEditState } from "./hooks/useBooking";
import { appointments, branches } from "../../api/client";

const editBookingQueryKey = (ref: string, email: string) =>
  ["edit-booking", ref, email] as const;

async function fetchEditBooking(
  ref: string,
  email: string,
): Promise<InitialEditState> {
  const [booking, branchList] = await Promise.all([
    appointments.getByReferenceAndEmail(ref, email),
    branches.list(),
  ]);
  const branch = branchList.find((b) => b.id === booking.branchId);
  if (!branch) {
    throw new Error("Branch not found");
  }
  return { booking, branch };
}

export const NewBooking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const editRef = searchParams.get("edit")?.trim() ?? "";
  const editEmailParam = searchParams.get("email")?.trim() ?? "";

  const { data: initialEdit, isLoading, error } = useQuery({
    queryKey: editBookingQueryKey(editRef, editEmailParam),
    queryFn: () => fetchEditBooking(editRef, editEmailParam),
    enabled: Boolean(editRef && editEmailParam),
  });

  if (editRef && editEmailParam) {
    if (isLoading) {
      return (
        <p className="text-gray-500 py-8 text-center">Loading…</p>
      );
    }
    if (error) {
      return (
        <p className="text-red-600 py-8 text-center" role="alert">
          {error instanceof Error ? error.message : "Failed to load booking"}
        </p>
      );
    }
    if (!initialEdit) {
      return null;
    }
  }

  return (
    <BookingFlow
      key={initialEdit ? initialEdit.booking.confirmationReference : "new"}
      initialEdit={initialEdit ?? null}
      clearEditParams={
        editRef && editEmailParam ? () => setSearchParams({}) : undefined
      }
    />
  );
};
