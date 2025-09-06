import AnimatedNumber from "@/components/custom-ui/resuseable/animated-number";
import Shimmer from "../shimmer/shimmer";
import React from "react";

export interface ProjectCounterProps
  extends React.HTMLAttributes<HTMLDivElement> {
  loading?: boolean;
  title: string;
  total: number | null;
  description: string;
  icon: any;
  symbol?: string;
}

const AchievementCounter = React.forwardRef<
  HTMLDivElement,
  ProjectCounterProps
>((props, ref: any) => {
  const { loading, title, total, symbol, description, icon } = props;

  const skeleton = (
    <div ref={ref} className="flex flex-col items-center">
      {/* Icon */}
      <Shimmer className="h-[24px] size-12 rounded-full" />
      <Shimmer className="h-12 w-32 mt-2 rounded-sm" />
      <Shimmer className="h-[24px] w-44 mt-3 rounded-sm" />
      <Shimmer className="h-[24px] w-44 mt-3 rounded-sm" />
    </div>
  );
  return loading ? (
    skeleton
  ) : (
    <div
      ref={ref}
      className="flex flex-col w-fit items-center hover:-translate-y-1 transition-transform"
    >
      {/* Icon */}
      {icon}
      <AnimatedNumber
        className="rtl:text-5xl ltr:text-5xl font-bold mt-2 text-primary"
        min={0}
        symbol={symbol}
        max={total}
      />
      {/* Content */}
      <h1 className=" font-medium rtl:text-xl-rtl ltr:text-2xl mt-3 text-center text-primary/90">
        {title}
      </h1>
      <p className="rtl:text-md ltr:text-md font-medium text-center text-primary/70">
        {description}
      </p>
    </div>
  );
});
export default AchievementCounter;
