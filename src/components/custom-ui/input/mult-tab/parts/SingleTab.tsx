import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface SingleTabProps {
  children: string;
  className?: string;
  onClick?: () => void;
}

export default function SingleTab({
  children,
  className,
  onClick,
}: SingleTabProps) {
  const { t } = useTranslation();

  return (
    <div
      onClick={onClick}
      className={cn(
        "capitalize rtl:text-md-rtl rtl:font-semibold ltr:text-lg-ltr rounded-sm py-[3px] px-2 bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-shadow duration-300 hover:shadow-sm cursor-pointer",
        className
      )}
    >
      {t(children)}
    </div>
  );
}
