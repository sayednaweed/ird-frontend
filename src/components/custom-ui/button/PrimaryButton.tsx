import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "normal" | "error";
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (props, ref: any) => {
    const { className, children, color = "normal", ...rest } = props;
    const style =
      color == "normal"
        ? "bg-primary hover:bg-primary"
        : "bg-red-400 hover:bg-red-400";
    return (
      <Button
        {...rest}
        ref={ref}
        size="sm"
        className={cn(
          `font-semibold rounded-sm cursor-pointer ltr:text-md-ltr rtl:font-semibold rtl:text-sm-rtl
           hover:shadow transition w-fit text-primary-foreground/80 shadow-md shadow-primary/50
            px-2 sm:px-4 leading-normal duration-200 ease-linear hover:opacity-90 hover:text-primary-foreground ${style}`,
          className
        )}
      >
        {children}
      </Button>
    );
  }
);
export default PrimaryButton;
