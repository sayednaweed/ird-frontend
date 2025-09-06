import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import AnimatedItem from "@/hook/animated-item";

export interface CustomTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  requiredHint?: string;
  label?: string;
  parentClassName?: string;
  errorMessage?: string;
}

const CustomTextarea = React.forwardRef<
  HTMLTextAreaElement,
  CustomTextareaProps
>(
  (
    {
      className,
      requiredHint,
      errorMessage,
      required,
      label,
      parentClassName = "",
      readOnly,
      ...rest
    },
    ref
  ) => {
    const hasError = !!errorMessage;

    return (
      <div className={parentClassName}>
        <div
          className={cn("relative", required || label ? "mt-[20px]" : "mt-2")}
        >
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
              className="absolute font-semibold rtl:text-lg-rtl ltr:text-xl-ltr rtl:right-[4px] ltr:left-[4px] ltr:-top-[26px] rtl:-top-[29px]"
            >
              {label}
            </label>
          )}

          {/* Textarea Field */}
          <Textarea
            ref={ref}
            readOnly={readOnly}
            className={cn(
              "appearance-none focus-visible:border-fourth/60 ltr:text-sm rtl:text-sm rtl:font-semibold placeholder:text-primary/60 focus-visible:ring-0 rounded focus-visible:shadow-sm focus-visible:ring-offset-0 transition-[border] bg-card dark:bg-black/30",
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
              from: { opacity: 0 },
              to: { opacity: 1 },
              config: { mass: 1, tension: 170, friction: 26 },
              reset: true,
            }}
            intersectionArgs={{ rootMargin: "-5% 0%" }}
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

CustomTextarea.displayName = "CustomTextarea";
export default CustomTextarea;
