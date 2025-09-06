import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SecondaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  (props, ref: any) => {
    const { className, children } = props;
    return (
      <Button
        {...props}
        ref={ref}
        size="sm"
        className={cn(
          `bg-tertiary hover:shadow-sm shadow-lg transition-shadow duration-200 ease-in-out hover:bg-tertiary rounded text-[12px] font-semibold w-fit text-white`,
          className
        )}
      >
        {children}
      </Button>
    );
  }
);
export default SecondaryButton;
