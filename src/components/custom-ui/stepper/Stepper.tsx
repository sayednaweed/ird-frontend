import { validate } from "@/validation/validation";
import { StepperContext } from "./StepperContext";
import StepperSteps from "./StepperSteps";
import StepperControl from "./StepperControl";
import { cn } from "@/lib/utils";
import NastranSpinner from "../spinner/NastranSpinner";
import React, { useState, type Dispatch, type SetStateAction } from "react";
import type {
  ComponentStep,
  StepperHeightSize,
  StepperSize,
} from "@/components/custom-ui/stepper/types";

export interface IStepperProps extends React.HTMLAttributes<HTMLDivElement> {
  loadingText: string;
  backText: string;
  nextText: string;
  confirmText: string;
  steps: {
    description: string;
    icon: any;
  }[];
  components: ComponentStep[];
  beforeStepSuccess?: (
    userData: any,
    step: number,
    setError: Dispatch<SetStateAction<Map<string, string>>>,
    backClicked: boolean
  ) => Promise<boolean>;
  stepsCompleted: (
    userData: any[],
    setError: Dispatch<SetStateAction<Map<string, string>>>
  ) => Promise<boolean>;
  onSaveClose?: (userData: any, currentStep: number) => Promise<void>;
  onSaveCloseText?: string;
  size?: StepperSize;
  heightsize?: StepperHeightSize;
  progressText: {
    complete: string;
    inProgress: string;
    pending: string;
    step: string;
  };
  isCardActive?: boolean;
}

const Stepper = React.forwardRef<HTMLDivElement, IStepperProps>(
  (props, ref) => {
    const {
      steps,
      loadingText,
      components,
      beforeStepSuccess,
      stepsCompleted,
      onSaveClose,
      className,
      size,
      backText,
      nextText,
      confirmText,
      progressText,
      isCardActive,
      onSaveCloseText,
    } = props;

    const [currentStep, setCurrentStep] = useState(1);
    const [userData, setUserData] = useState<any>([]);
    const [error, setError] = useState<Map<string, string>>(new Map());
    const validationSuccess = (step: number) =>
      validate(components[step - 1].validationRules, userData, setError);

    const displayStep = (step: number) => components[step - 1].component;

    const handleDirection = async (direction: string) => {
      let backClicked = false;
      if (direction == "again") {
        setCurrentStep(1);
        return;
      }
      let newStep = currentStep;

      if (direction == "next") {
        if (false == (await validationSuccess(currentStep))) {
          return;
        }
        newStep++;
      } else {
        newStep--;
        backClicked = true;
      }
      if (newStep === steps.length) {
        setUserData({ ...userData, ["complete"]: false });
        const complete = await stepsCompleted(userData, setError);
        setUserData({ ...userData, complete: true });
        if (!complete) return;
      }
      // For performance reason
      if (beforeStepSuccess) {
        // Send data to user in each step
        setUserData({ ...userData, ["complete"]: false });
        const complete = await beforeStepSuccess(
          userData,
          currentStep,
          setError,
          backClicked
        );
        setUserData({ ...userData, complete: true });
        if (!complete) return;
      }

      newStep > 0 && newStep <= steps.length && setCurrentStep(newStep);
    };

    return (
      <div
        ref={ref}
        className={cn("w-full overflow-hidden rounded-2xl pb-2", className)}
      >
        {/* Stepper */}
        <div className={`${!isCardActive && "mt-4"} w-full`}>
          <StepperSteps
            isCardActive={isCardActive}
            progressText={progressText}
            steps={steps}
            currentStep={currentStep}
          />
          {/* Display components */}
          <div
            className={`w-full h-fit overflow-y-auto py-8 ${
              isCardActive
                ? "bg-card px-3 sm:px-7 rounded-md border border-primary/10 dark:border-primary/20"
                : "mb-4 mt-12"
            } ${
              size === "sm"
                ? "min-h-[40vh]"
                : size === "md"
                ? "min-h-[60vh]"
                : size === "lg"
                ? "min-h-[65vh]"
                : "min-h-[60vh]"
            }`}
          >
            <StepperContext.Provider
              value={{
                userData,
                setUserData,
                handleDirection,
                error,
              }}
            >
              {userData?.complete == false ? (
                <NastranSpinner label={`${loadingText}...`} className="mt-20" />
              ) : (
                displayStep(currentStep)
              )}
            </StepperContext.Provider>
          </div>
        </div>
        {/* StepperControl */}
        {currentStep != steps.length && (
          <StepperControl
            isCardActive={isCardActive}
            backText={backText}
            inProgress={userData?.complete == false}
            nextText={nextText}
            confirmText={confirmText}
            handleClick={handleDirection}
            currentStep={currentStep}
            steps={steps}
            onSaveCloseText={onSaveCloseText}
            onSaveClose={async () => {
              if (onSaveClose) await onSaveClose(userData, currentStep);
            }}
          />
        )}
      </div>
    );
  }
);

export default Stepper;
