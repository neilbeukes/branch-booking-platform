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

export function BookingFlow({
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

  const isConfirmStep = currentStep.id === "confirm";
  const showBackButton = !isFirstStep && (!isConfirmStep || !!initialEdit);

  return (
    <Stepper
      currentStep={currentStep.id}
      steps={STEPS}
      onBack={goBack}
      isFirstStep={isFirstStep}
      showBackButton={showBackButton}
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
