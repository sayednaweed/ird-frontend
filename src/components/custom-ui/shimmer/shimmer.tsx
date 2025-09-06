import { cn } from "@/lib/utils";

export interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Shimmer(props: ShimmerProps) {
  const { className, children } = props;
  return (
    <div
      className={cn(
        `relative shadow-sm h-[200px] w-full rounded-lg overflow-hidden bg-primary/10`,
        className
      )}
    >
      <div
        className={`absolute w-full h-full bg-[length:1200px_100%] animate-shimmer bg-[linear-gradient(to_right,var(--from-shimmer)_10%,var(--to-shimmer)_18%,var(--from-shimmer)_25%)]`}
      />
      {children}
    </div>
  );
}
