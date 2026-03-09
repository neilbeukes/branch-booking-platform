import { useState } from "react";
import { Branch, Slot, ConfirmationPayload } from "../../../types";
import { STEPS } from "../consts";
import { toast } from "react-hot-toast";
import { dateAndSlotFromBooking } from "../../../utils/bookingDisplay";
import { BookingListItem } from "../../../types";

export interface InitialEditState {
  booking: BookingListItem;
  branch: Branch;
}

const useBooking = (initialEdit: InitialEditState | null = null) => {
  const editDateAndSlot = initialEdit
    ? dateAndSlotFromBooking(initialEdit.booking)
    : null;
  const initialDate = editDateAndSlot?.date ?? "";
  const initialSlot = editDateAndSlot?.slot ?? null;

  const [stepIndex, setStepIndex] = useState<number>(() =>
    initialEdit ? 2 : 0,
  );
  const [branch, setBranch] = useState<Branch | null>(
    () => initialEdit?.branch ?? null,
  );
  const [date, setDate] = useState(() => initialDate);
  const [slot, setSlot] = useState<Slot | null>(() => initialSlot);
  const [confirmation, setConfirmation] = useState<ConfirmationPayload | null>(
    null,
  );

  const editReference = initialEdit?.booking.confirmationReference ?? null;
  const editEmail = initialEdit?.booking.customerEmail ?? null;
  const defaultDetails =
    initialEdit?.booking.customerName != null
      ? {
          customerName: initialEdit.booking.customerName,
          customerPhone: initialEdit.booking.customerPhone ?? "",
          customerEmail: initialEdit.booking.customerEmail ?? "",
        }
      : undefined;

  const currentStep = STEPS[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const goNext = () => {
    if (isLastStep) return;
    setStepIndex(stepIndex + 1);
  };

  const goBack = () => {
    if (isFirstStep) return;
    setStepIndex(stepIndex - 1);
  };

  const handleBranchSelect = (b: Branch) => {
    setBranch(b);
    goNext();
  };

  const handleDateTimeSelect = (d: string, s: Slot) => {
    setDate(d);
    setSlot(s);
    goNext();
  };

  const handleDetailsSubmit = (data: ConfirmationPayload) => {
    setConfirmation(data);
    toast.success(editReference ? "Booking updated" : "Booking confirmed");
    goNext();
  };

  const handleReset = () => {
    setStepIndex(0);
    setBranch(null);
    setDate("");
    setSlot(null);
    setConfirmation(null);
  };

  return {
    branch,
    date,
    slot,
    confirmation,
    currentStep,
    isFirstStep,
    goNext,
    goBack,
    handleBranchSelect,
    handleDateTimeSelect,
    handleDetailsSubmit,
    handleReset,
    editReference,
    editEmail,
    defaultDetails,
  };
};

export default useBooking;
