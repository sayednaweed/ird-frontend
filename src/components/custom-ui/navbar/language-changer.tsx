import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";
import { supportedLanguages } from "@/lib/i18n/i18n";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { memo, useMemo } from "react";
import axiosClient from "@/lib/axois-client";
import { getLangCode } from "@/lib/utils";

export function LanguageChanger({ className }: { className?: string }) {
  const { t, i18n } = useTranslation();
  const current = getLangCode(i18n.language);
  const changeLanguage = async (lang: string) => {
    try {
      const { data } = await axiosClient.get(`lang/${lang}`);
      toast.success(data?.message);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error changing language");
    }

    await i18n.changeLanguage(lang);
  };

  const selectLangName = useMemo(
    () => supportedLanguages.find((lang) => lang.code === current)?.name,
    [current]
  );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        <div className="rounded-full gap-x-2 text-fourth ltr:text-lg-ltr rtl:text-lg-rtl px-2 py-1 border flex items-center justify-center cursor-pointer bg-card hover:bg-fourth/10 transition-colors duration-300">
          <Globe className="w-4 h-4 pointer-events-none" />
          <h1 className=" hidden sm:block rtl:text-sm-rtl rtl:font-semibold">
            {t(selectLangName ?? "english")}
          </h1>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuLabel>
          <h1 className="rtl:text-md-rtl ltr:text-xs font-semibold">
            {t("choose_a_language")}
          </h1>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedLanguages.map(({ name, code }) => (
          <DropdownMenuItem
            key={code}
            className={`rtl:justify-end text-primary/80 rtl:text-lg-ltr rtl:font-semibold ltr:text-xs ${
              current === code ? "bg-slate-200 dark:bg-slate-900" : ""
            }`}
            onClick={() => changeLanguage(code)}
          >
            {t(name)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default memo(LanguageChanger);
