import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import OrganizationHeader from "@/views/pages/auth-features/organization/organization-header";
import { OrganizationTable } from "@/views/pages/auth-features/organization/organization-table";
export default function OrganizationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  return (
    <div className="px-2 pt-2 pb-16 flex flex-col gap-y-[2px] relative select-none rtl:text-2xl-rtl ltr:text-xl-ltr">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("organizations")}</BreadcrumbItem>
      </Breadcrumb>
      <OrganizationHeader />
      <OrganizationTable />
    </div>
  );
}
