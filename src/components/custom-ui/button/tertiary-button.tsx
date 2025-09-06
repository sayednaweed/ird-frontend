import { cn } from "@/lib/utils";
import * as React from "react";

export interface TertiaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const TertiaryButton = React.forwardRef<HTMLButtonElement, TertiaryButtonProps>(
  (props, ref) => {
    const { className, children, disabled } = props;
    return (
      <button
        {...props}
        ref={ref}
        className={cn(
          `w-fit flex bg-fourth font-extralight rtl:text-lg-rtl ltr:text-xl-ltr justify-between text-white items-center rounded-full px-4 py-1 shadow-sm shadow-primary/50 dark:shadow-none hover:translate-y-[-2px] hover:bg-fourth/90 transition-transform duration-150 cursor-pointer ${
            disabled && "cursor-not-allowed"
          }`,
          className
        )}
      >
        {children}
      </button>
    );
  }
);

export default TertiaryButton;
