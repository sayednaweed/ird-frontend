import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, KeyRound, Loader, UserRoundCog } from "lucide-react";

import UserProfileHeader from "./user-profile-header";
import { EditProfilePassword } from "../general/edit-profile-password";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import UserProfileInformation from "@/views/pages/auth-features/profile/users/steps/user-profile-information";
import { RoleEnum, StatusEnum } from "@/database/model-enums";
import OrganizationProfileInformation from "@/views/pages/auth-features/profile/users/steps/organization-profile-information";
import IconButton from "@/components/custom-ui/button/icon-button";
import type { Organization } from "@/database/models";

export default function UsersProfilePage() {
  const { user } = useGeneralAuthState();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });

  const selectedTabStyle = `shrink-0 grow-0 data-[state=active]:transition-all rtl:text-xl-rtl ltr:text-lg-ltr relative w-[95%] bg-card-foreground/5 justify-start mx-auto ltr:py-2 rtl:py-[5px] data-[state=active]:bg-tertiary font-semibold data-[state=active]:text-primary-foreground gap-x-3`;

  const organizationButton =
    user.role.role == RoleEnum.organization &&
    ((user as Organization).agreement_status_id ==
    StatusEnum.registration_incomplete ? (
      <IconButton
        onClick={() =>
          navigate(`/dashboard/organization/profile/edit/${user.id}`, {
            replace: true,
          })
        }
        className="hover:bg-primary/5 gap-x-4 grid grid-cols-[1fr_4fr] w-[90%] xxl:w-[50%] sm:w-[90%] mx-auto transition-all text-primary rtl:px-3 rtl:py-1 ltr:p-2"
      >
        <Loader
          className={`size-[18px] pointer-events-none justify-self-end`}
        />
        <h1
          className={`rtl:text-lg-rtl ltr:text-xl-ltr justify-self-start text-start font-semibold`}
        >
          {t("continue_regis")}
        </h1>
      </IconButton>
    ) : (
      <IconButton
        onClick={() => navigate(`/dashboard/organizations/${user.id}`)}
        className="hover:bg-primary/5 gap-x-4 grid grid-cols-[1fr_4fr] w-[90%] xxl:w-[50%] sm:w-[90%] mx-auto transition-all text-primary rtl:px-3 rtl:py-1 ltr:p-2"
      >
        <UserRoundCog
          className={`size-[18px] pointer-events-none justify-self-end`}
        />
        <h1
          className={`rtl:text-lg-rtl ltr:text-xl-ltr justify-self-start text-start font-semibold`}
        >
          {t("detail")}
        </h1>
      </IconButton>
    ));

  return (
    <div className="flex flex-col gap-y-3 px-3 pt-2 pb-16">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("profile")}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{user?.username}</BreadcrumbItem>
      </Breadcrumb>

      {/* Cards */}
      <Tabs
        dir={direction}
        defaultValue="Account"
        className="flex flex-col md:flex-row gap-y-2 gap-x-6"
      >
        <TabsList className="h-fit overflow-x-auto flex-col w-full md:w-fit md:min-w-80 bg-card border gap-4 pb-12">
          <UserProfileHeader />
          <TabsTrigger className={`mt-6 ${selectedTabStyle}`} value="Account">
            <Database className="size-[18px]" />
            {t("account_information")}
          </TabsTrigger>
          <TabsTrigger className={`${selectedTabStyle}`} value="password">
            <KeyRound className="size-[18px]" />
            {t("account_password")}
          </TabsTrigger>
          {organizationButton}
        </TabsList>
        {user.role.role == RoleEnum.organization ? (
          <TabsContent value="Account">
            <OrganizationProfileInformation />
          </TabsContent>
        ) : user.role.role == RoleEnum.donor ? (
          <TabsContent value="Account">
            <UserProfileInformation />
          </TabsContent>
        ) : (
          <TabsContent value="Account">
            <UserProfileInformation />
          </TabsContent>
        )}
        <TabsContent value="password">
          <EditProfilePassword url="profiles/change-password" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
