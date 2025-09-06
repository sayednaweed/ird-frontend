import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router";

import { Activity } from "./activity";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import { PermissionEnum } from "@/database/model-enums";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export default function ActivityPage() {
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const location = useLocation();
  const urlParts = location.pathname.split("/");
  const selectedId = urlParts[urlParts.length - 1];
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });

  return (
    <div className="p-2 pb-16">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("activity")}</BreadcrumbItem>
      </Breadcrumb>
      <Tabs
        dir={direction}
        value={selectedId}
        className="flex flex-col pb-16 items-center"
      >
        <TabsContent
          value={PermissionEnum.activity.sub.user_activity.toString()}
          className="px-2 pt-2 flex flex-col gap-y-[2px] w-full relative select-none rtl:text-2xl-rtl ltr:text-xl-ltr"
        >
          <Activity />
        </TabsContent>
      </Tabs>
    </div>
  );
}
