import { cn } from "@/lib/utils";

export interface ErrorTextProps {
  text: string;
  className?: string;
}

export default function ErrorText(props: ErrorTextProps) {
  const { text, className } = props;
  return (
    <div className={cn("rtl:text-2xl-rtl font-bold text-red-400", className)}>
      {text}
    </div>
  );
}
