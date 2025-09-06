import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import React from "react";

export interface CustomCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange: (value: boolean) => void;
  checked: boolean;
  loading?: boolean;
  text?: string;
  description?: string;
  requiredHint?: string;
  hintColor?: string;
  errorMessage?: string;
  parentClassName?: string;
}
const CustomCheckbox = React.forwardRef<HTMLInputElement, CustomCheckboxProps>(
  (props, ref: any) => {
    const {
      onCheckedChange,
      required,
      checked,
      loading,
      text,
      description,
      className,
      requiredHint,
      errorMessage,
      readOnly,
      hintColor,
      parentClassName,
    } = props;
    const error = errorMessage != undefined;
    return (
      <div>
        {required && (
          <h1
            className={cn(
              "text-red-600 w-full px-3 text-end rtl:text-[13px] ltr:text-[11px] font-semibold",
              hintColor
            )}
          >
            {requiredHint}
          </h1>
        )}
        <div
          className={`flex items-center space-x-4 ${parentClassName} ${
            error && "border-red-400 border"
          }`}
        >
          {loading ? (
            <NastranSpinner label=" " className="size-[20px]" />
          ) : (
            <Checkbox
              checked={checked}
              disabled={readOnly}
              className={cn("border-primary/70", className)}
              ref={ref}
              onCheckedChange={(value: boolean) => {
                if (!readOnly) onCheckedChange(value);
              }}
            />
          )}

          <label className="text-sm font-medium space-y-1 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {text && (
              <h1 className="text-start rtl:text-lg-rtl ltr:text-lg-ltr font-semibold">
                {text}
              </h1>
            )}
            {description && (
              <h1 className="text-start rtl:pr-1 rtl:text-lg-rtl ltr:text-lg-ltr pt-[2px] ltr:leading-3.5 rtl:leading-5 text-primary/80">
                {description}
              </h1>
            )}
          </label>
        </div>
        {errorMessage && (
          <h1 className="rtl:text-sm-rtl ltr:text-sm-ltr capitalize text-start text-red-400">
            {errorMessage}
          </h1>
        )}
      </div>
    );
  }
);

export default CustomCheckbox;
