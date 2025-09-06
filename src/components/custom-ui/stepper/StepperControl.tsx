import { memo, useState } from "react";
import ButtonSpinner from "../spinner/ButtonSpinner";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import PrimaryButton from "../button/PrimaryButton";

export interface IStepperControlProps {
  backText: string;
  nextText: string;
  inProgress: boolean;
  confirmText: string;
  steps: {
    description: string;
    icon: any;
  }[];
  currentStep: number;
  isCardActive?: boolean;
  handleClick: (direction: string) => void;
  onSaveClose?: () => Promise<void>;
  onSaveCloseText?: string;
}
function StepperControl(props: IStepperControlProps) {
  const {
    steps,
    currentStep,
    handleClick,
    backText,
    nextText,
    confirmText,
    isCardActive,
    inProgress,
    onSaveClose,
    onSaveCloseText,
  } = props;
  const [loading, setLoading] = useState(false);

  const onClose = async () => {
    if (onSaveClose) {
      setLoading(true);
      await onSaveClose();
      setLoading(false);
    }
  };
  return (
    <div
      className={`${
        isCardActive &&
        "mt-[3px] rounded-md bg-card py-4 border border-primary/10 dark:border-primary/20"
      } flex flex-wrap gap-x-1 gap-y-4 justify-around mb-4 text-[13px]`}
    >
      {/* Back Button */}

      <button
        disabled={loading}
        onClick={() => {
          if (currentStep != 1) handleClick("back");
        }}
        className={`${
          currentStep == 1
            ? "opacity-50 cursor-not-allowed"
            : "hover:shadow shadow-md shadow-primary/50 hover:text-primary-foreground"
        } bg-primary flex gap-x-2 items-center rounded-md transition rtl:text-sm-rtl ltr:text-md-ltr sm:ltr:text-lg-ltr font-semibold w-fit text-primary-foreground/80 px-3 py-[6px] hover:bg-primary`}
      >
        <ChevronLeft className="size-[18px] inline rtl:rotate-180" />
        {backText}
      </button>
      {/* Next Button */}
      <PrimaryButton
        onClick={() => handleClick("next")}
        disabled={loading || inProgress}
        className={`bg-green-500 hover:bg-green-500`}
      >
        <ButtonSpinner loading={loading || inProgress}>
          {currentStep == steps.length - 1 ? (
            <>
              {confirmText}
              <Check className="size-[18px] inline rtl:rotate-180" />
            </>
          ) : (
            <>
              {nextText}
              <ChevronRight className="size-[18px] inline rtl:rotate-180" />
            </>
          )}
        </ButtonSpinner>
      </PrimaryButton>
      {onSaveCloseText && (
        <PrimaryButton
          disabled={loading || inProgress}
          onClick={onClose}
          className={`shadow-lg`}
        >
          <ButtonSpinner loading={loading}>{onSaveCloseText}</ButtonSpinner>
        </PrimaryButton>
      )}
    </div>
  );
}
export default memo(StepperControl);
