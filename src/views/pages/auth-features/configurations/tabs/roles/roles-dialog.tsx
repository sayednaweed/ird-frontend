import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { validate } from "@/validation/validation";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { BasicModel } from "@/database/models";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import PermissionSub from "@/components/custom-ui/resuseable/permission-sub";
import type { IUserPermission, UserAction } from "@/lib/types";
import ServerError from "@/components/custom-ui/resuseable/server-error";
import MultipleSelector from "@/components/custom-ui/select/MultipleSelector";
import type { Option } from "@/lib/types";
import { PermissionEnum, RoleEnum } from "@/database/model-enums";
import { useScrollToElement } from "@/hook/use-scroll-to-element";
export interface RoleDialogProps {
  onComplete: (role: BasicModel, isEdited: boolean) => void;
  onCancel?: () => void;
  role?: BasicModel;
}
export default function RoleDialog(props: RoleDialogProps) {
  const { onComplete, role, onCancel } = props;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(new Map<string, string>());
  useScrollToElement(error);
  const [userData, setUserData] = useState<{
    name_english: string;
    name_farsi: string;
    name_pashto: string;
    optional_lang: string;
    permissions: IUserPermission[];
    user_role_assignment: Option[];
    hasUserAdd: boolean;
  }>({
    name_english: "",
    name_farsi: "",
    name_pashto: "",
    optional_lang: "",
    permissions: [],
    user_role_assignment: [],
    hasUserAdd: false,
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  const initialize = async () => {
    try {
      const response = await axiosClient.get(`roles/new/role-permissions`);
      const rolePermissions = response.data as IUserPermission[];

      if (response.status == 200) {
        setUserData({ ...userData, permissions: rolePermissions });
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setFetching(false);
    }
  };
  const fetch = async () => {
    try {
      const response = await axiosClient.get(`roles/${role?.id}`);
      if (response.status === 200) {
        const data = response.data;
        for (const item of response.data.permissions as IUserPermission[]) {
          if (item.id == PermissionEnum.users.id && item.add) {
            const roleAssignmentsResponse = await axiosClient.get(
              `roles/assignments`,
              {
                params: {
                  id: role?.id,
                  per: PermissionEnum.users.id,
                },
              }
            );
            data.user_role_assignment = roleAssignmentsResponse.data;
            data.hasUserAdd = true;
            break;
          }
        }
        if (!data.hasUserAdd) {
          data.user_role_assignment = [];
        }
        setUserData(data);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    if (role) fetch();
    else initialize();
  }, []);

  const action = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "name_english",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "name_farsi",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "name_pashto",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "user_role_assignment",
            rules: [
              (userData: any) => {
                if (
                  userData.hasUserAdd &&
                  userData.user_role_assignment.length == 0
                ) {
                  return true;
                }
                return false;
              },
            ],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const ids = [];
      for (const item of userData.user_role_assignment) {
        ids.push(item.id);
      }
      const data = {
        id: role?.id,
        name_english: userData.name_english,
        name_farsi: userData.name_farsi,
        name_pashto: userData.name_pashto,
        permissions: userData.permissions,
        user_role_assignment: userData.hasUserAdd
          ? userData.user_role_assignment
          : [],
      };
      const response = role
        ? await axiosClient.put("roles", data)
        : await axiosClient.post("roles", data);
      if (response.status === 200) {
        toast.success(response.data.message);
        if (role) onComplete(response.data.role, true);
        else onComplete(response.data.role, false);
        modelOnRequestHide();
      }
    } catch (error: any) {
      toast.error(<ServerError errors={error.response.data.errors} />);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loader = (
    <CardContent className="space-y-5">
      <Shimmer className="h-12" />
      <Shimmer className="h-36" />
    </CardContent>
  );

  const mainActions: {
    [key in UserAction]: (value: boolean, permissionId: number) => void;
  } = {
    add: (value: boolean, permissionId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) =>
          perm.id === permissionId
            ? { ...perm, add: value, view: value ? value : perm.view }
            : perm
      );
      setUserData({
        ...userData,
        permissions: updatedUserData,
        hasUserAdd:
          permissionId === PermissionEnum.users.id
            ? value
            : userData.hasUserAdd,
      });
    },
    delete: (value: boolean, permissionId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) =>
          perm.id === permissionId
            ? { ...perm, delete: value, view: value ? value : perm.view }
            : perm
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    edit: (value: boolean, permissionId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) =>
          perm.id === permissionId
            ? { ...perm, edit: value, view: value ? value : perm.view }
            : perm
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    view: (value: boolean, permissionId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) =>
          perm.id === permissionId ? { ...perm, view: value } : perm
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    singleRow: (value: boolean, permissionId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) =>
          perm.id === permissionId
            ? {
                ...perm,
                add: value,
                edit: value,
                delete: value,
                view: value,
              }
            : perm
      );
      setUserData({
        ...userData,
        permissions: updatedUserData,
        hasUserAdd:
          permissionId === PermissionEnum.users.id
            ? value
            : userData.hasUserAdd,
      });
    },
  };
  const subActions: {
    [key in UserAction]: (
      value: boolean,
      permissionId: number,
      subId: number
    ) => void;
  } = {
    add: (value: boolean, permissionId: number, subId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) => {
          if (perm.id === permissionId) {
            // Update the sub array with the updated SubPermission
            const updatedSub = perm.sub.map((sub) =>
              sub.id === subId
                ? { ...sub, add: value, view: value ? value : sub.view }
                : sub
            );
            return { ...perm, sub: updatedSub }; // Return the updated permission object
          }
          return perm; // No change for other permissions
        }
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    delete: (value: boolean, permissionId: number, subId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) => {
          if (perm.id === permissionId) {
            // Update the sub array with the updated SubPermission
            const updatedSub = perm.sub.map((sub) =>
              sub.id === subId
                ? { ...sub, delete: value, view: value ? value : sub.view }
                : sub
            );
            return { ...perm, sub: updatedSub }; // Return the updated permission object
          }
          return perm; // No change for other permissions
        }
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    edit: (value: boolean, permissionId: number, subId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) => {
          if (perm.id === permissionId) {
            // Update the sub array with the updated SubPermission
            const updatedSub = perm.sub.map((sub) =>
              sub.id === subId
                ? { ...sub, edit: value, view: value ? value : sub.view }
                : sub
            );
            return { ...perm, sub: updatedSub }; // Return the updated permission object
          }
          return perm; // No change for other permissions
        }
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    view: (value: boolean, permissionId: number, subId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) => {
          if (perm.id === permissionId) {
            // Update the sub array with the updated SubPermission
            const updatedSub = perm.sub.map((sub) =>
              sub.id === subId ? { ...sub, view: value } : sub
            );
            return { ...perm, sub: updatedSub }; // Return the updated permission object
          }
          return perm; // No change for other permissions
        }
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
    singleRow: (value: boolean, permissionId: number, subId: number) => {
      const updatedUserData = userData.permissions.map(
        (perm: IUserPermission) => {
          if (perm.id === permissionId) {
            // Update the sub array with the updated SubPermission
            const updatedSub = perm.sub.map((sub) =>
              sub.id === subId
                ? {
                    ...sub,
                    add: value,
                    edit: value,
                    delete: value,
                    view: value,
                  }
                : sub
            );
            return { ...perm, sub: updatedSub }; // Return the updated permission object
          }
          return perm; // No change for other permissions
        }
      );
      setUserData({ ...userData, permissions: updatedUserData });
    },
  };

  const setRoleAssignment = (option: Option[]) => {
    setUserData((prev) => ({
      ...prev,
      user_role_assignment: option,
    }));
  };

  return (
    <Card className="w-full px-2 md:w-fit md:min-w-[700px] self-center bg-card my-12">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {role ? t("edit") : t("add")}
        </CardTitle>
      </CardHeader>
      {/* {slideshow && fetching ? ( */}
      {fetching ? (
        loader
      ) : (
        <>
          <CardContent className="">
            <BorderContainer
              title={t("name")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0 mb-8"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabInput
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData({
                    ...userData,
                    [key]: tabName,
                    optional_lang: tabName,
                  });
                }}
                onChanged={(value: string, name: string) => {
                  setUserData({
                    ...userData,
                    [name]: value,
                  });
                }}
                name="name"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("detail")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabInput>
            </BorderContainer>
            {userData.hasUserAdd && role?.id != RoleEnum.super && (
              <MultipleSelector
                popoverClassName="h-36"
                commandProps={{
                  label: "Select frameworks",
                  className: "mt-0 h-full mb-8",
                }}
                placeholder={t("select")}
                onChange={setRoleAssignment}
                // defaultOptions={frameworks}
                selectedOptions={userData.user_role_assignment}
                errorMessage={error.get("user_role_assignment")}
                apiUrl={role ? `roles/by-role/${role.id}` : "roles/by/user"}
                emptyIndicator={
                  <p className="text-center text-sm">{t("no_item")}</p>
                }
                label={t("user_role_assignment")}
                className="w-full rounded-sm"
                required={true}
                requiredHint={`* ${t("required")}`}
                cacheData={false}
              />
            )}
            {userData.permissions.map(
              (item: IUserPermission, index: number) => (
                <PermissionSub
                  subActions={subActions}
                  mainActions={mainActions}
                  permission={item}
                  key={index}
                />
              )
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4 justify-center xxl:justify-between">
            <Button
              className="rtl:text-xl-rtl ltr:text-lg-ltr"
              variant="outline"
              onClick={() => {
                modelOnRequestHide();
                if (onCancel) onCancel();
              }}
            >
              {t("cancel")}
            </Button>
            {role?.id != RoleEnum.super && role?.id != RoleEnum.debugger && (
              <PrimaryButton
                disabled={loading}
                color={error.size > 0 ? "error" : "normal"}
                onClick={action}
                className={`${loading && "opacity-90"}`}
                type="submit"
              >
                <ButtonSpinner loading={loading}>
                  {t(role ? "update" : "save")}
                </ButtonSpinner>
              </PrimaryButton>
            )}
          </CardFooter>
        </>
      )}
    </Card>
  );
}
