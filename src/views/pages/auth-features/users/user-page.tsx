import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { UserTable } from "./user-table";
import UserHeader from "./user-header";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";

export default function UserPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });

  return (
    <div className="px-2 pt-2 pb-8 flex flex-col gap-y-[2px] relative select-none rtl:text-2xl-rtl ltr:text-xl-ltr">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("users")}</BreadcrumbItem>
      </Breadcrumb>
      <UserHeader />
      <UserTable />
    </div>
  );
}
