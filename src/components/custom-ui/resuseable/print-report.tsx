import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EllipsisVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface PrintReportProps {
  className?: string;
  onGeneratePdfClick?: () => void;
  onGenerateExcelClick?: () => void;
}

export default function PrintReport(props: PrintReportProps) {
  const { className, onGeneratePdfClick, onGenerateExcelClick } = props;
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <EllipsisVertical
          className={cn(
            "text-primary size-6 hover:text-primary/80 cursor-pointer",
            className
          )}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuItem
          onClick={() => onGeneratePdfClick && onGeneratePdfClick()}
          className={`rtl:justify-end text-primary/80 rtl:text-lg-ltr rtl:font-semibold ltr:text-xs`}
        >
          {t("generate_pdf")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onGenerateExcelClick && onGenerateExcelClick()}
          className={`rtl:justify-end text-primary/80 rtl:text-lg-ltr rtl:font-semibold ltr:text-xs`}
        >
          {t("generate_excel")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
