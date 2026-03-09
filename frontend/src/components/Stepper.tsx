import type { ReactNode } from "react";
import { StepId } from "../features/newBooking/consts";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { Button } from "./Button";

interface StepperProps {
  currentStep: StepId;
  isFirstStep: boolean;
  steps: { id: StepId; label: string; heading: string }[];
  children?: ReactNode;
  onBack: () => void;
  showBackButton?: boolean;
}

export function Stepper({
  currentStep,
  steps,
  onBack,
  isFirstStep,
  showBackButton = true,
  children,
}: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const currentStepConfig = steps[currentIndex];

  return (
    <div className="mb-8">
      <nav
        aria-label="Progress"
        className="flex items-center justify-center gap-2 mb-6"
      >
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isPast = index < currentIndex;
          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`
                  flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium
                  ${isActive ? "border-green-600 bg-green-600 text-white" : ""}
                  ${isPast ? "border-green-600 bg-green-600 text-white" : ""}
                  ${!isActive && !isPast ? "border-gray-300 bg-white text-gray-500" : ""}
                `}
              >
                {isPast ? <FaCheck className="w-4 h-4" /> : index + 1}
              </div>
              <span
                className={`ml-1.5 text-sm font-medium md:block hidden ${isActive ? "text-green-600" : "text-gray-500"}`}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`mx-2 w-8 h-0.5 ${index < currentIndex ? "bg-green-600" : "bg-gray-200"}`}
                />
              )}
            </div>
          );
        })}
      </nav>

      {currentStepConfig && (
        <div className="flex items-center gap-2 justify-start pb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className={isFirstStep || !showBackButton ? "hidden" : ""}
            aria-label="Go back"
          >
            <FaArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              {currentStepConfig.heading}
            </h2>
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
