import i18n from "@/lib/i18n/i18n";
import { useEffect } from "react";

const RTL_LANGUAGES = ["ar", "ps", "fa"];

export function isRTL(lang: string) {
  return RTL_LANGUAGES.includes(lang);
}

export function useDirectionChange() {
  useEffect(() => {
    const handleLangChange = (lng: string) => {
      const dir = isRTL(lng) ? "rtl" : "ltr";
      document.documentElement.dir = dir;
      document.documentElement.lang = lng;

      if (dir == "rtl") {
        document.body.style.fontFamily = "Arial";
      } else document.body.style.fontFamily = "Roboto, Segoe UI";
    };

    handleLangChange(i18n.language); // initial
    i18n.on("languageChanged", handleLangChange);

    return () => i18n.off("languageChanged", handleLangChange);
  }, [i18n]);
}
