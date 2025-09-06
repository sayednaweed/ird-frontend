import { cn } from "@/lib/utils";
import SingleTab from "./SingleTab";
import type { ReactElement, ReactNode } from "react";
import React from "react";
interface OptionalTabsProps {
  children: ReactElement<typeof SingleTab> | ReactElement<typeof SingleTab>[];
  className?: string;
  onClick?: () => void;
}

export default function OptionalTabs(props: OptionalTabsProps) {
  const { children, className, onClick } = props;

  const processTabs = (children: ReactNode) => {
    return React.Children.map(children, (child, index) => {
      if (index % 2 == 0) {
        return (
          <>
            <div>/</div>
            {child}
          </>
        );
      } else {
        return child;
      }
    });
  };
  const elements = processTabs(children);
  return (
    <div onClick={onClick} className={cn("", className)}>
      {elements}
    </div>
  );
}
