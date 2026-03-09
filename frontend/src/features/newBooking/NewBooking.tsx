import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookingFlow } from "./BookingStepperFlow";
import type { InitialEditState } from "./hooks/useBooking";
import { appointments, branches } from "../../api/client";

export const NewBooking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const editRef = searchParams.get("edit")?.trim();
  const editEmailParam = searchParams.get("email")?.trim();
  const [initialEdit, setInitialEdit] = useState<InitialEditState | null>(null);
  const [loading, setLoading] = useState(!!(editRef && editEmailParam));
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!editRef || !editEmailParam) return;
    let cancelled = false;
    (async () => {
      try {
        const [booking, branchList] = await Promise.all([
          appointments.getByReferenceAndEmail(editRef, editEmailParam),
          branches.list(),
        ]);
        if (cancelled) return;
        const branch = branchList.find((b) => b.id === booking.branchId);
        if (!branch) {
          setLoadError("Branch not found");
          setLoading(false);
          return;
        }
        setInitialEdit({ booking, branch });
      } catch (e) {
        if (!cancelled)
          setLoadError(
            e instanceof Error ? e.message : "Failed to load booking",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editRef, editEmailParam]);

  if (editRef && editEmailParam) {
    if (loading)
      return <p className="text-gray-500 py-8 text-center">Loading…</p>;
    if (loadError)
      return (
        <p className="text-red-600 py-8 text-center" role="alert">
          {loadError}
        </p>
      );
    if (!initialEdit) return null;
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
