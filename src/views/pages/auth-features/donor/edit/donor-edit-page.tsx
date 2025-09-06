import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axois-client";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Database } from "lucide-react";
import EditInformationTab from "./steps/edit-information-tab";

import EditStatusTab from "./steps/edit-status-tab";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type { UserPermission } from "@/database/models";
import { PermissionEnum } from "@/database/model-enums";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { toast } from "sonner";
import type { EditDonorInformation } from "@/lib/types";
import DonorEditHeader from "@/views/pages/auth-features/donor/edit/donor-edit-header";

export interface IDonorInformation {
  donorInformation: EditDonorInformation;
}
export default function DonorEditPage() {
  const { user } = useUserAuthState();
  const navigate = useNavigate();
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const { t, i18n } = useTranslation();
  let { id } = useParams();
  const direction = i18n.dir();
  const [failed, setFailed] = useState(false);
  const [userData, setUserData] = useState<IDonorInformation | undefined>(
    undefined
  );

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`/donors/${id}`);
      if (response.status == 200) {
        const donor = response.data.donor as EditDonorInformation;
        // Do not allow until register form is submitted

        setUserData({
          donorInformation: donor,
        });
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
    PermissionEnum.donor.name
  ) as UserPermission;
  const tableList = useMemo(
    () =>
      Array.from(per.sub).map(([key, _subPermission], index: number) => {
        return key == PermissionEnum.donor.sub.information ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Database className="size-[18px]" />
            {t("donor_information")}
          </TabsTrigger>
        ) : key == PermissionEnum.donor.sub.status ? (
          <TabsTrigger
            className={`${selectedTabStyle}`}
            key={index}
            value={key.toString()}
          >
            <Activity className="size-[18px]" />
            {t("status")}
          </TabsTrigger>
        ) : undefined;
      }),
    []
  );

  return (
    <div className="flex flex-col gap-y-3 px-3 pt-2 pb-16">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleGoBack}>{t("donors")}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{userData?.donorInformation?.username}</BreadcrumbItem>
      </Breadcrumb>
      {/* Cards */}
      <Tabs
        dir={direction}
        defaultValue={PermissionEnum.donor.sub.information.toString()}
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
              <DonorEditHeader userData={userData} />
              {tableList}
            </TabsList>

            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.donor.sub.information.toString()}
            >
              <EditInformationTab
                refreshPage={loadInformation}
                failed={failed}
                loading={userData == undefined}
                permissions={per}
                donorInformation={userData.donorInformation}
                setUserData={setUserData}
              />
            </TabsContent>
            <TabsContent
              className="flex-1 m-0"
              value={PermissionEnum.donor.sub.status.toString()}
            >
              <EditStatusTab permissions={per} />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
