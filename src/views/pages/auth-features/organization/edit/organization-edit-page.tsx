import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axois-client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  CloudDownload,
  CloudUpload,
  Database,
  Grip,
  KeyRound,
  NotebookPen,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";
import EditDirectorTab from "./steps/edit-director-tab";
import EditAgreemenTab from "./steps/edit-agreement-tab";
import EditMoreInformationTab from "./steps/edit-more-information-tab";
import EditInformationTab from "./steps/edit-information-tab";
import EditStatusTab from "./steps/edit-status-tab";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import EditRepresentativeTab from "./steps/edit-representative-tab";
import UploadRegisterFormDailog from "./parts/upload-register-form-Dailog";
import EditAgreementStatusTab from "./steps/edit-agreement-status-tab";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import { PermissionEnum, StatusEnum } from "@/database/model-enums";
import { toast } from "sonner";
import type { UserPermission } from "@/database/models";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import IconButton from "@/components/custom-ui/button/icon-button";
import type { OrganizationInformation } from "@/lib/types";
import OrganizationEditHeader from "@/views/pages/auth-features/organization/edit/organization-edit-header";
import { EditOrganizationPassword } from "@/views/pages/auth-features/organization/edit/steps/edit-organization-password";
import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";
import { generateUUID } from "@/lib/utils";

export interface IOrganizationInformation {
  organizationInformation: OrganizationInformation;
  registerFormSubmitted: boolean;
}
export default function OrganizationEditPage() {
  const { user } = useGeneralAuthState();
  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const { t, i18n } = useTranslation();
  let { id } = useParams();
  const start = useDownloadStore((s) => s.startDownload);

  const direction = i18n.dir();
  const [failed, setFailed] = useState(false);
  const [userData, setUserData] = useState<
    IOrganizationInformation | undefined
  >(undefined);
  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`organization/header-info/${id}`);
      if (response.status == 200) {
        const organization = response.data
          .organization as OrganizationInformation;
        // Do not allow until register form is submitted
        const registerFormSubmitted =
          organization.status_id == StatusEnum.document_upload_required;
        if (organization.status_id == StatusEnum.registration_incomplete) {
          navigate(`/dashboard/organization/profile/edit/${id}`, {
            state: {
              data: { edit: true },
            },
          });
          return;
        } else {
          setUserData({
            organizationInformation: organization,
            registerFormSubmitted: registerFormSubmitted,
          });
        }
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
      setFailed(true);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);

  const selectedTabStyle = `rtl:text-xl-rtl ltr:text-lg-ltr relative w-[95%] bg-card-foreground/5 justify-start mx-auto ltr:py-2 rtl:py-[5px] data-[state=active]:bg-tertiary font-semibold data-[state=active]:text-primary-foreground gap-x-3`;

  const per: UserPermission = user?.permissions.get(
    PermissionEnum.organization.name
  ) as UserPermission;

  const tableList = useMemo(
    () =>
      Array.from(per.sub).map(([key, _subPermission], index: number) => {
        return key == PermissionEnum.organization.sub.information ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Database className="size-[18px]" />
            {t("organization_information")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.director_information ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <UserRound className="size-[18px]" />
            {t("director_information")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.agreement ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <NotebookPen className="size-[18px]" />
            {t("agreement_checklist")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.more_information ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Grip className="size-[18px]" />
            {t("more_information")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.status ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Activity className="size-[18px]" />
            {t("status")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.representative ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <UsersRound className="size-[18px]" />
            {t("representative")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.account_password ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <KeyRound className="size-[18px]" />
            {t("account_password")}
          </TabsTrigger>
        ) : key == PermissionEnum.organization.sub.agreement_status ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <KeyRound className="size-[18px]" />
            {t("agreement_status")}
          </TabsTrigger>
        ) : undefined;
      }),
    []
  );

  const registerationExpired: boolean =
    userData?.organizationInformation.status_id == StatusEnum.expired;
  return (
    <div className="flex flex-col gap-y-2 px-3 mt-2 pb-12">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleGoBack}>
          {t("organizations")}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {userData?.organizationInformation?.username}
        </BreadcrumbItem>
      </Breadcrumb>
      {/* Cards */}
      <Tabs
        dir={direction}
        defaultValue={PermissionEnum.organization.sub.information.toString()}
        className="flex flex-col md:flex-row gap-x-3 gap-y-2 md:gap-y-0"
      >
        {!userData ? (
          <>
            <Shimmer className="min-h-fit sm:min-h-[80vh] w-full md:w-[300px]" />
            <Shimmer className="h-full w-full" />
          </>
        ) : (
          <>
            <TabsList className="sm:min-h-[550px] h-fit pb-8 min-w-[300px] md:w-[300px] gap-y-4 items-start justify-start flex flex-col bg-card border">
              <OrganizationEditHeader userData={userData} />
              {tableList}

              {registerationExpired && (
                <IconButton
                  onClick={() =>
                    navigate(`/organization/register/extend/${id}`)
                  }
                  className="hover:bg-primary/5 gap-x-4 grid grid-cols-[1fr_4fr] w-[90%] xxl:w-[50%] md:w-[90%] mx-auto transition-all text-primary rtl:px-3 rtl:py-1 ltr:p-2"
                >
                  <Zap
                    className={`size-[18px] pointer-events-none justify-self-end`}
                  />
                  <h1
                    className={`rtl:text-lg-rtl ltr:text-xl-ltr justify-self-start text-start font-semibold`}
                  >
                    {t("extend_reg")}
                  </h1>
                </IconButton>
              )}
              {userData.organizationInformation.status_id ==
                StatusEnum.document_upload_required && (
                <>
                  <NastranModel
                    size="md"
                    isDismissable={false}
                    button={
                      <IconButton className="hover:bg-primary/5 gap-x-4 grid grid-cols-[1fr_4fr] w-[90%] xxl:w-[50%] md:w-[90%] mx-auto transition-all text-primary rtl:px-3 rtl:py-1 ltr:p-2">
                        <CloudUpload
                          className={`size-[18px] pointer-events-none justify-self-end`}
                        />
                        <h1
                          className={`rtl:text-lg-rtl ltr:text-xl-ltr justify-self-start text-start font-semibold`}
                        >
                          {t("up_register_fo")}
                        </h1>
                      </IconButton>
                    }
                    showDialog={async () => true}
                  >
                    <UploadRegisterFormDailog
                      onComplete={() => {
                        const organizationInformation =
                          userData.organizationInformation;
                        organizationInformation.status_id = StatusEnum.pending;
                        setUserData({
                          ...userData,
                          organizationInformation: organizationInformation,
                        });
                      }}
                    />
                  </NastranModel>
                  <IconButton
                    onClick={() =>
                      start({
                        id: generateUUID(),
                        filename: `${userData.organizationInformation.name}.zip`,
                        url: `organization/generate/registeration/${id}`,
                      })
                    }
                    className="hover:bg-primary/5 gap-x-4 mx-auto grid grid-cols-[1fr_4fr] w-[90%] xxl:w-[50%] md:w-[90%] transition-all text-primary rtl:px-3 rtl:py-1 ltr:p-2"
                  >
                    <CloudDownload
                      className={`size-[18px] pointer-events-none justify-self-end`}
                    />
                    <h1
                      className={`rtl:text-lg-rtl ltr:text-xl-ltr font-semibold justify-self-start`}
                    >
                      {t("download_r_form")}
                    </h1>
                  </IconButton>
                </>
              )}
            </TabsList>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.information.toString()}
            >
              <EditInformationTab
                permissions={per}
                registerationExpired={registerationExpired}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.director_information.toString()}
            >
              <EditDirectorTab
                permissions={per}
                registerationExpired={registerationExpired}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.agreement.toString()}
            >
              <EditAgreemenTab />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.more_information.toString()}
            >
              <EditMoreInformationTab
                permissions={per}
                registerationExpired={registerationExpired}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.status.toString()}
            >
              <EditStatusTab
                permissions={per}
                registerationExpired={registerationExpired}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.representative.toString()}
            >
              <EditRepresentativeTab
                permissions={per}
                registerationExpired={registerationExpired}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.account_password.toString()}
            >
              <EditOrganizationPassword
                id={id}
                permissions={per}
                failed={failed}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.organization.sub.agreement_status.toString()}
            >
              <EditAgreementStatusTab />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
