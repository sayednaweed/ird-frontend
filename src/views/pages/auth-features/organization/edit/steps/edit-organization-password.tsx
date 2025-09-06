import CustomInput from "@/components/custom-ui/input/CustomInput";
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
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import type { UserPermission } from "@/database/models";
import type { ValidateItem } from "@/validation/types";
import { PermissionEnum } from "@/database/model-enums";
import { toast } from "sonner";
export interface EditOrganizationPasswordProps {
  failed: boolean;
  permissions: UserPermission;
  id?: string;
}

export function EditOrganizationPassword(props: EditOrganizationPasswordProps) {
  const { failed, permissions, id } = props;
  const { t } = useTranslation();
  const [storing, setStoring] = useState(false);

  const [passwordData, setPasswordData] = useState({
    new_password: "",
    confirm_password: "",
    your_account_password: "",
  });
  const [error, setError] = useState<Map<string, string>>(new Map());

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };
  const saveData = async () => {
    setStoring(true);
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
      {
        name: "your_account_password",
        rules: ["required"],
      },
    ];
    const passed = await validate(rules, passwordData, setError);
    if (!passed) {
      setStoring(false);
      return;
    }

    try {
      const response = await axiosClient.post("organizations/change/password", {
        organization_id: id,
        new_password: passwordData.new_password,
        confirm_password: passwordData.confirm_password,
        your_account_password: passwordData.your_account_password,
      });
      if (response.status == 200) {
        setPasswordData({
          new_password: "",
          confirm_password: "",
          your_account_password: "",
        });
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };

  const update_password = permissions.sub.get(
    PermissionEnum.organization.sub.account_password
  );
  const hasEdit = update_password?.edit;
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_password")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_pass_descrip")}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 w-full sm:w-[70%] md:w-1/2">
        {failed ? (
          <h1>{t("u_are_not_authzed!")}</h1>
        ) : (
          <>
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
            <CustomInput
              size_="sm"
              name="your_account_password"
              label={t("your_account_password")}
              required={true}
              requiredHint={`* ${t("required")}`}
              defaultValue={passwordData["your_account_password"]}
              onChange={handleChange}
              placeholder={t("enter_password")}
              errorMessage={error.get("your_account_password")}
              type={"password"}
            />
          </>
        )}
      </CardContent>
      <CardFooter>
        {!failed && hasEdit && (
          <PrimaryButton
            disabled={storing}
            onClick={async () => {
              await saveData();
            }}
            className={`shadow-lg`}
          >
            <ButtonSpinner loading={storing}>{t("save")}</ButtonSpinner>
          </PrimaryButton>
        )}
      </CardFooter>
    </Card>
  );
}
