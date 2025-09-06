import axiosClient from "@/lib/axois-client";
import { useTranslation } from "react-i18next";
import type { Applications, UserPermission } from "@/database/models";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { ApplicationEnum, PermissionEnum } from "@/database/model-enums";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { RealtimeApiCallInput } from "@/components/custom-ui/input/realtime-api-call-input-";
import RealtimeApiCallCheckbox from "@/components/custom-ui/combobox/realtime-api-call-checkbox-";

interface ApplicationTabProps {
  permissions: UserPermission;
}
export default function ApplicationTab(props: ApplicationTabProps) {
  const { permissions } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Applications[]>([]);

  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/applications");
      if (response.status == 200) {
        setApplications(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);
  const hasEdit = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_role
  )?.edit;

  const saveData = useCallback(async (data: any) => {
    let result = false;

    try {
      const response = await axiosClient.put("applications", data);
      if (response.status == 200) {
        result = true;
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    }
    return result;
  }, []);
  const findReplace = (
    item: Applications,
    result: boolean | undefined,
    value: any
  ) => {
    if (result) {
      toast.success(t("success"));
      setApplications((prev) => {
        const updatedList = [...prev]; // clone the array
        const index = updatedList.findIndex((row) => row.id === item.id);

        if (index !== -1) {
          item.value = `${value}`;
          updatedList[index] = item; // replace at same position
        }

        return updatedList;
      });
    }
  };

  return (
    <>
      {loading ? (
        <Shimmer className="h-14 rounded" />
      ) : (
        applications.map((item) => {
          if (item.id == ApplicationEnum.user_approval) {
            return (
              <RealtimeApiCallCheckbox
                key={item.id}
                loading={loading}
                item={item}
                hasEdit={hasEdit}
                postCallback={saveData}
                findReplace={findReplace}
              />
            );
          } else if (
            item.id == ApplicationEnum.organization_registeration_valid_time
          ) {
            return (
              <RealtimeApiCallInput
                key={item.id}
                item={item}
                postCallback={saveData}
                hasEdit={hasEdit}
                regix={/^\d+$/}
                findReplace={findReplace}
                loading={loading}
                type={t("day")}
                delay={1000}
              />
            );
          }
          return undefined;
        })
      )}
    </>
  );
}
