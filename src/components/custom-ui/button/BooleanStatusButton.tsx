import { cn } from "@/lib/utils";

export interface BooleanStatusButtonProps {
  getColor: () => {
    style: string;
    value?: string;
  };
  className?: string;
}

export default function BooleanStatusButton(props: BooleanStatusButtonProps) {
  const { getColor, className } = props;
  const data = getColor();

  return (
    <div
      className={cn(
        `border-[1px] mx-0 min-w-fit min-h-7 rtl:text-xl-rtl ltr:text-[13px] rtl:font-medium w-fit flex items-center gap-x-2 ltr:py-[2px] rtl:py-[2px] px-[10px] rounded-full ${data.style}`,
        className
      )}
    >
      <div
        className={`size-[12px] min-h-[10px] min-w-[12px] rounded-full border-[3px] ${data.style}`}
      />
      <h1 className="text-nowrap">{data.value}</h1>
    </div>
  );
}
