import React from "react";
import { cn, isString } from "@/lib/utils";
import AnimatedItem from "@/hook/animated-item";
import { PhoneInput } from "react-international-phone";

export interface CustomPhoneInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  requiredHint?: string;
  label?: string;
  errorMessage?: string;
  defaultCountry?: string;
  parentClassName?: string;
}

const CustomPhoneInput = React.forwardRef<
  HTMLInputElement,
  CustomPhoneInputProps
>(
  (
    {
      className,
      type,
      requiredHint,
      errorMessage,
      required,
      label,
      value,
      onChange,
      readOnly,
      defaultCountry = "af",
      parentClassName,
      name,
      ...rest
    },
    _ref
  ) => {
    const hasError = !!errorMessage;

    return (
      <div className={cn(parentClassName, "flex flex-col justify-end")}>
        <div
          className={cn(
            "relative select-none h-fit rtl:text-lg-rtl ltr:text-lg-ltr",
            required || label ? "mt-[20px]" : "mt-2"
          )}
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
              className="absolute font-semibold rtl:text-xl-rtl ltr:text-lg-ltr rtl:right-[4px] ltr:left-[4px] ltr:-top-[26px] rtl:-top-[29px]"
            >
              {label}
            </label>
          )}
          <PhoneInput
            name={name}
            defaultCountry={defaultCountry}
            {...rest}
            value={isString(value) ? value : ""}
            onChange={(phone) => {
              const data = { target: { name: name, value: phone } } as any;
              if (onChange) onChange(data);
            }}
            className="!grid grid-cols-[auto_1fr] [&>input]:!border-primary/25 [&>input]:!text-primary [&>input]:!bg-transparent"
            inputStyle={{
              height: "50px",
              padding: "10px",
            }}
            countrySelectorStyleProps={{
              className: "!h-[50px] !border-primary",
              buttonClassName:
                "!bg-transparent p-0 m-0 !h-[50px] !border-primary/25",
              dropdownStyleProps: {
                className: " !bg-card !border !rounded",
                listItemDialCodeClassName: "!text-primary/60",
                listItemCountryNameClassName: "!text-primary",
                listItemSelectedClassName: "!bg-input/60",
                listItemClassName: "hover:!bg-input/60",
              },
            }}
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

CustomPhoneInput.displayName = "CustomPhoneInput";
export default CustomPhoneInput;
