import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axois-client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CloudDownload,
  CloudUpload,
  Database,
  Grip,
  NotebookPen,
  UserRound,
  Zap,
} from "lucide-react";

import NastranModel from "@/components/custom-ui/model/NastranModel";

import ProjectEditHeader from "./project-edit-header";
import EditCenterBudgetTab from "./steps/edit-center-budget-tab";
import EditOrganizationStructureTab from "./steps/edit-organization-structure-tab";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import type { ProjectHeaderType } from "@/lib/types";
import type { UserPermission } from "@/database/models";
import { PermissionEnum, RoleEnum, StatusEnum } from "@/database/model-enums";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import IconButton from "@/components/custom-ui/button/icon-button";
import UploadMouDailog from "@/views/pages/auth-features/projects/edit/parts/upload-mou-dailog";
import EditDetailsTab from "@/views/pages/auth-features/projects/edit/steps/edit-details-tab";
import { toast } from "sonner";
import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";
import EditChecklistTab from "@/views/pages/auth-features/projects/edit/steps/edit-checklist-tab";

export default function ProjectEditPage() {
  const { user } = useGeneralAuthState();
  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const { t, i18n } = useTranslation();
  let { id } = useParams();
  const direction = i18n.dir();
  const start = useDownloadStore((s) => s.startDownload);

  const [userData, setUserData] = useState<ProjectHeaderType | undefined>(
    undefined
  );
  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`projects/header-info/${id}`);
      if (response.status == 200) {
        const header = response.data as ProjectHeaderType;
        setUserData(header);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);

  const selectedTabStyle = `shrink-0 grow-0 data-[state=active]:transition-all rtl:text-xl-rtl ltr:text-lg-ltr relative w-[95%] bg-card-foreground/5 justify-start mx-auto ltr:py-2 rtl:py-[5px] data-[state=active]:bg-tertiary font-semibold data-[state=active]:text-primary-foreground gap-x-3`;

  const per: UserPermission = user?.permissions.get(
    PermissionEnum.projects.name
  ) as UserPermission;
  const hasEdit =
    per.edit &&
    (userData?.status_id != StatusEnum.scheduled ||
      userData?.status_id == StatusEnum.has_comment);

  const tableList = useMemo(
    () =>
      Array.from(per.sub).map(([key, _subPermission], index: number) => {
        return key == PermissionEnum.projects.sub.detail ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Database className="size-[18px]" />
            {t("detail")}
          </TabsTrigger>
        ) : key == PermissionEnum.projects.sub.center_budget ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <UserRound className="size-[18px]" />
            {t("center_budget")}
          </TabsTrigger>
        ) : key == PermissionEnum.projects.sub.organ_structure ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <NotebookPen className="size-[18px]" />
            {t("organ_structure")}
          </TabsTrigger>
        ) : key == PermissionEnum.projects.sub.checklist ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Grip className="size-[18px]" />
            {t("checklist")}
          </TabsTrigger>
        ) : undefined;
      }),
    []
  );

  const buttons = useMemo(() => {
    if (user.role.role == RoleEnum.organization && userData) {
      return (
        <>
          {userData.status_id == StatusEnum.expired && (
            <IconButton
              onClick={() => navigate(`/projects/extend/${id}`)}
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
          {userData.status_id == StatusEnum.document_upload_required && (
            <>
              <NastranModel
                size="lg"
                isDismissable={false}
                button={
                  <IconButton className="hover:bg-primary/5 gap-x-4 grid grid-cols-[1fr_4fr] w-[90%] xxl:w-[50%] md:w-[90%] mx-auto transition-all text-primary rtl:px-3 rtl:py-1 ltr:p-2">
                    <CloudUpload
                      className={`size-[18px] pointer-events-none justify-self-end`}
                    />
                    <h1
                      className={`rtl:text-lg-rtl ltr:text-xl-ltr justify-self-start text-start font-semibold`}
                    >
                      {t("upload_signed_mou")}
                    </h1>
                  </IconButton>
                }
                showDialog={async () => true}
              >
                <UploadMouDailog
                  onComplete={() =>
                    setUserData((prev: any) => ({
                      ...prev,
                      status_id: StatusEnum.pending,
                    }))
                  }
                />
              </NastranModel>
              <IconButton
                onClick={() =>
                  start({
                    id: crypto.randomUUID(),
                    filename: `${userData.name}.zip`,
                    url: `projects/generate/mou/${id}`,
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
                  {t("down_mou")}
                </h1>
              </IconButton>
            </>
          )}
        </>
      );
    }
  }, [userData]);
  return (
    <div className="flex flex-col gap-y-2 px-3 mt-2 pb-12">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleGoBack}>{t("projects")}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{userData?.name}</BreadcrumbItem>
      </Breadcrumb>
      {/* Cards */}
      <Tabs
        dir={direction}
        defaultValue={PermissionEnum.projects.sub.detail.toString()}
        className="flex flex-col md:flex-row gap-y-2 gap-x-6"
      >
        {!userData ? (
          <>
            <Shimmer className="min-h-fit sm:min-h-[80vh] w-full md:w-[300px]" />
            <Shimmer className="h-full w-full" />
          </>
        ) : (
          <>
            <TabsList className="h-fit overflow-x-auto flex-col w-full md:w-fit md:min-w-80 bg-card border gap-4 pb-12">
              <ProjectEditHeader userData={userData} />
              {tableList}

              {buttons}
            </TabsList>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.projects.sub.detail.toString()}
            >
              <EditDetailsTab hasEdit={hasEdit} />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.projects.sub.center_budget.toString()}
            >
              <EditCenterBudgetTab hasEdit={hasEdit} />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.projects.sub.organ_structure.toString()}
            >
              <EditOrganizationStructureTab permissions={per} />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.projects.sub.checklist.toString()}
            >
              <EditChecklistTab hasEdit={hasEdit} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
