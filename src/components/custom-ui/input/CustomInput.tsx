import React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AnimatedItem from "@/hook/animated-item";

export type NastranInputSize = "sm" | "md" | "lg" | undefined;

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  startContent?: React.ReactNode;
  startContentDark?: boolean;
  requiredHint?: string;
  label?: string;
  endContent?: React.ReactNode;
  errorMessage?: string;
  parentClassName?: string;
  size_: NastranInputSize;
}

const CustomInput = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      requiredHint,
      startContent,
      startContentDark,
      endContent,
      parentClassName = "",
      size_,
      errorMessage,
      required,
      label,
      readOnly,
      ...rest
    },
    ref
  ) => {
    const hasError = !!errorMessage;

    const inputPaddingClass = startContent
      ? "rtl:pr-[42px] ltr:ps-[42px]"
      : "rtl:pr-[12px] ltr:ps-[12px]";

    const startContentClass = startContentDark
      ? "h-full bg-primary w-[40px] pt-[2px] rtl:rounded-tr-md rtl:rounded-br-md ltr:rounded-tl-md ltr:rounded-bl-md"
      : "top-[16px] ltr:left-[12px] rtl:right-[12px]";

    return (
      <div className={cn(parentClassName, "flex flex-col justify-end h-fit")}>
        <div
          className={cn(
            "relative select-none h-fit rtl:text-lg-rtl ltr:text-lg-ltr",
            required || label ? "mt-[20px]" : "mt-2"
          )}
        >
          {/* Start Content */}
          {startContent && (
            <span
              className={cn("absolute flex items-center", startContentClass)}
            >
              {startContent}
            </span>
          )}

          {/* End Content */}
          {endContent && (
            <span className="absolute flex items-center ltr:right-[5px] rtl:left-[5px] top-[16px]">
              {endContent}
            </span>
          )}

          {/* Required Hint */}
          {required && requiredHint && (
            <span className="absolute font-semibold text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-[10px] rtl:left-[10px] -top-[17px]">
              {requiredHint}
            </span>
          )}

          {/* Label */}
          {label && (
            <label
              htmlFor={label}
              className="absolute font-semibold rtl:text-xl-rtl ltr:text-lg-ltr rtl:right-[4px] ltr:left-[4px] ltr:-top-[26px] rtl:-top-[29px]"
            >
              {label}
            </label>
          )}

          {/* Input Field */}
          <Input
            ref={ref}
            type={type}
            readOnly={readOnly}
            style={{ height: "50px" }}
            className={cn(
              "appearance-none placeholder:text-primary/60 ltr:text-sm rtl:text-sm rtl:font-semibold focus-visible:ring-0 rounded focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card dark:bg-black/30",
              "focus-visible:border-fourth/60",
              "[&::-webkit-outer-spin-button]:appearance-none",
              "[&::-webkit-inner-spin-button]:appearance-none",
              "[-moz-appearance:textfield]",
              inputPaddingClass,
              hasError ? "border-red-400 border" : "border-primary/25",
              readOnly && "cursor-not-allowed",
              className
            )}
            {...rest}
          />
        </div>

        {/* Error Message */}
        {hasError && (
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
                transform: "translateY(-8px)",
              },
              config: {
                mass: 1,
                tension: 210,
                friction: 20,
              },
              to: {
                opacity: 1,
                transform: "translateY(0px)",
              },
            }}
            intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
          >
            <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-sm-ltr">
              {errorMessage}
            </h1>
          </AnimatedItem>
        )}
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";
export default CustomInput;
