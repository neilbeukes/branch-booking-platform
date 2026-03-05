import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AnimatePresence,
  easeIn,
  motion,
  type MotionProps,
} from "framer-motion";
import { BranchStep } from "./components/BranchStep";
import { DateTimeStep } from "./components/DateTimeStep";
import { DetailsStep } from "./components/DetailsStep";
import { ConfirmationStep } from "./components/ConfirmationStep";
import { Stepper } from "../../components/Stepper";
import useBooking from "./hooks/useBooking";
import type { InitialEditState } from "./hooks/useBooking";
import { STEPS } from "./consts";
import { appointments } from "../../api/client";
import { branches } from "../../api/client";

type StepTransitionConfig = Pick<
  MotionProps,
  "initial" | "animate" | "exit" | "transition"
>;

const stepTransition: StepTransitionConfig = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.15,
    ease: easeIn,
  },
};

function BookingFlow({
  initialEdit,
  clearEditParams,
}: {
  initialEdit: InitialEditState | null;
  clearEditParams?: () => void;
}) {
  const {
    currentStep,
    branch,
    date,
    slot,
    confirmation,
    goBack,
    handleBranchSelect,
    handleDateTimeSelect,
    handleDetailsSubmit,
    handleReset,
    isFirstStep,
    editReference,
    editEmail,
    defaultDetails,
  } = useBooking(initialEdit);

  const renderStep = () => {
    switch (currentStep.id) {
      case "branch":
        return <BranchStep onSelect={handleBranchSelect} />;
      case "datetime":
        if (!branch) return null;
        return <DateTimeStep branch={branch} onSelect={handleDateTimeSelect} />;
      case "details":
        if (!branch || !date || !slot) return null;
        return (
          <DetailsStep
            branch={branch}
            date={date}
            slot={slot}
            onSubmit={handleDetailsSubmit}
            editReference={editReference ?? undefined}
            editEmail={editEmail ?? undefined}
            defaultValues={defaultDetails}
          />
        );
      case "confirm":
        if (!confirmation) return null;
        return (
          <ConfirmationStep
            data={confirmation}
            onNewBooking={() => {
              handleReset();
              clearEditParams?.();
            }}
          />
        );
      default:
        return null;
    }
  };

  const stepContent = renderStep();
  if (!stepContent) return null;

  return (
    <Stepper
      currentStep={currentStep.id}
      steps={STEPS}
      onBack={goBack}
      isFirstStep={isFirstStep}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentStep.id}
          initial={stepTransition.initial}
          animate={stepTransition.animate}
          exit={stepTransition.exit}
          transition={stepTransition.transition}
        >
          {stepContent}
        </motion.div>
      </AnimatePresence>
    </Stepper>
  );
}

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
