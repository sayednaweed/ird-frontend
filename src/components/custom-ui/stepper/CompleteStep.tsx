import PrimaryButton from "../button/PrimaryButton";
import { useContext } from "react";
import { StepperContext } from "./StepperContext";
import AnimatedPath from "@/components/custom-ui/animation/animated-path";

export interface ICompleteStepProps {
  description: string;
  successText: string;
  closeText: string;
  againText?: string;
  closeModel: () => void;
}

export default function CompleteStep(props: ICompleteStepProps) {
  const { handleDirection, setUserData } = useContext(StepperContext);
  const { description, closeModel, closeText, againText, successText } = props;
  return (
    <div className="flex flex-col items-center mt-8">
      <div
        className={`rounded-full transition duration-500 ease-in-out border-2 size-[80px] flex items-center justify-center py-3 bg-green-600 text-white font-bold border-green-600`}
      >
        {/* <span className=" text-white font-bold text-[32px]">&#10003;</span> */}
        <svg width="45px" height="43px" viewBox="0 0 130 85">
          <AnimatedPath
            d="M10,50 l25,40 l85,-90"
            stroke="#fafafa"
            strokeWidth={20}
            duration={2000}
            fill="none"
          />
        </svg>
      </div>
      <h1 className="text-green-600 rtl:text-[22px] ltr:text-lg-ltr font-semibold uppercase mt-4">
        {successText}
      </h1>
      <h1 className="rtl:text-2xl-rtl font-medium text-primary ltr:text-lg-ltr">
        {description}
      </h1>
      <PrimaryButton
        className="rounded-md mt-14 min-w-[80px] shadow-md rtl:text-xl-rtl bg-red-500 hover:bg-red-500"
        onClick={closeModel}
      >
        {closeText}
      </PrimaryButton>
      {againText && (
        <PrimaryButton
          className="rounded-md mt-4 min-w-[80px] shadow-md rtl:text-xl-rtl"
          onClick={() => {
            setUserData([]);
            handleDirection("again");
          }}
        >
          {againText}
        </PrimaryButton>
      )}
    </div>
  );
}
