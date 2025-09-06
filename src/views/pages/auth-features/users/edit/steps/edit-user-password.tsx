import CustomInput from "@/components/custom-ui/input/CustomInput";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import type { UserInformation, UserPassword } from "@/lib/types";
import type { UserPermission } from "@/database/models";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type { ValidateItem } from "@/validation/types";
import { PermissionEnum } from "@/database/model-enums";
import { toast } from "sonner";
export interface EditUserPasswordProps {
  id: string | undefined;
  refreshPage: () => Promise<void>;
  userData: UserInformation | undefined;
  failed: boolean;
  permissions: UserPermission;
}

export function EditUserPassword(props: EditUserPasswordProps) {
  const { id, userData, failed, refreshPage, permissions } = props;
  const { user, logoutUser } = useUserAuthState();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const [passwordData, setPasswordData] = useState<UserPassword>({
    new_password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<Map<string, string>>(new Map());

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  const saveData = async () => {
    if (id != undefined) {
      setLoading(true);
      // 1. Validate form
      const rules: ValidateItem[] = [
        {
          name: "new_password",
          rules: ["required", "min:8", "max:45"],
        },
        {
          name: "confirm_password",
          rules: ["required", "min:8", "max:45"],
        },
      ];
      const passed = await validate(rules, passwordData, setError);
      if (!passed) {
        setLoading(false);
        return;
      }
      try {
        const response = await axiosClient.post("users/change-password", {
          id: id,
          new_password: passwordData.new_password,
          confirm_password: passwordData.confirm_password,
        });
        if (response.status == 200) {
          toast.success(t(response.data.message));
          // If user changed his password he must login again
          if (user?.id == id) await logoutUser();
        }
      } catch (error: any) {
        toast.error(error.response.data.message);
        setServerError(error.response.data.errors, setError);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const hasEdit = permissions.sub.get(
    PermissionEnum.users.sub.user_information
  )?.edit;
  return (
    <Card className="shadow-none">
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_password")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_pass_descrip")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {failed ? (
          <h1>{t("u_are_not_authzed!")}</h1>
        ) : !userData ? (
          <NastranSpinner />
        ) : (
          <div className="grid gap-4 w-full sm:w-[70%] md:w-1/2">
            <CustomInput
              size_="sm"
              name="new_password"
              label={t("new_password")}
              required={true}
              requiredHint={`* ${t("required")}`}
              defaultValue={passwordData["new_password"]}
              onChange={handleChange}
              placeholder={t("enter_password")}
              errorMessage={error.get("new_password")}
              type={"password"}
            />
            <CustomInput
              size_="sm"
              name="confirm_password"
              label={t("confirm_password")}
              required={true}
              requiredHint={`* ${t("required")}`}
              defaultValue={passwordData["confirm_password"]}
              onChange={handleChange}
              placeholder={t("enter_password")}
              errorMessage={error.get("confirm_password")}
              type={"password"}
            />
          </div>
        )}
      </CardContent>
      <CardFooter>
        {failed ? (
          <PrimaryButton
            onClick={async () => await refreshPage()}
            className="bg-red-500 hover:bg-red-500/70"
          >
            {t("failed_retry")}
            <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
          </PrimaryButton>
        ) : (
          userData &&
          hasEdit && (
            <PrimaryButton
              disabled={loading}
              onClick={async () => {
                await saveData();
              }}
              className={`shadow-lg`}
            >
              <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
            </PrimaryButton>
          )
        )}
      </CardFooter>
    </Card>
  );
}
