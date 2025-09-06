import { useTranslation } from "react-i18next";
import LanguageTab from "./tabs/language/language-tab";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbSeparator,
  BreadcrumbItem,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="p-2">
      <Breadcrumb>
        <BreadcrumbHome />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("settings")}</BreadcrumbItem>
      </Breadcrumb>
      <LanguageTab />
    </div>
  );
}
