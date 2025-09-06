import { cn } from "@/lib/utils";

interface BorderContainerProps {
  title: string;
  required: boolean;
  children?: any;
  className?: string;
  parentClassName?: string;
}
export default function BorderContainer(props: BorderContainerProps) {
  const { children, title, required, className, parentClassName } = props;
  return (
    <div
      className={cn(
        "border rounded-[4px] relative w-full p-4",
        parentClassName
      )}
    >
      <span className="absolute ltr:left-2 rtl:right-2 top-[-14px] bg-card font-semibold rtl:text-lg-rtl ltr:text-xl-ltr">
        {title} {required && <span className="text-red-500">*</span>}
      </span>
      <div className={cn("flex items-center", className)}>{children}</div>
    </div>
  );
}
