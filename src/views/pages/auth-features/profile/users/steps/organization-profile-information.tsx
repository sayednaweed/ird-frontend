import CustomInput from "@/components/custom-ui/input/CustomInput";
import { CalendarDays, ChevronsUpDown, Mail, UserRound } from "lucide-react";
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
import { toLocaleDate } from "@/lib/utils";
import { useGlobalState } from "@/context/GlobalStateContext";
import FakeCombobox from "@/components/custom-ui/combobox/FakeCombobox";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type { Role } from "@/database/models";
import { toast } from "sonner";
import CustomPhoneInput from "@/components/custom-ui/input/custom-phone-input";

interface ProfileInformation {
  id: string;
  full_name: string;
  username: string;
  email: string;
  role: Role;
  contact: string;
  job: string;
  division: string;
  created_at: string;
  imagePreviewUrl: any;
}
export default function OrganizationProfileInformation() {
  const { user, setUser } = useUserAuthState();
  const [state] = useGlobalState();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const [userData, setUserData] = useState<ProfileInformation>({
    id: user.id,
    imagePreviewUrl: undefined,
    username: user.username,
    full_name: user.full_name,
    email: user.email,
    contact: user.contact,
    division: user.division,
    job: user.job,
    role: user.role,
    created_at: user.created_at,
  });
  const handleChange = (e: any) => {
    if (userData) {
      const { name, value } = e.target;
      setUserData({ ...userData, [name]: value });
    }
  };
  const saveData = async () => {
    if (loading) return;
    setLoading(true);
    // 1. Validation
    if (
      !(await validate(
        [
          { name: "username", rules: ["required", "max:45", "min:3"] },
          { name: "email", rules: ["required", "max:45", "min:3"] },
          { name: "contact", rules: ["required", "phone", "max:45", "min:3"] },
        ],
        userData,
        setError
      ))
    ) {
      setLoading(false);
      return;
    }
    try {
      const response = await axiosClient.put("profiles-organizations", {
        username: userData.username,
        contact: userData.contact,
        email: userData.email,
      });
      if (response.status == 200) {
        // Change logged in user data

        setUser({
          ...user,
          username: userData.username,
          full_name: userData.full_name,
          email: userData.email,
          contact: userData.contact,
        });

        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className=" shadow-none">
      <CardHeader>
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_information")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("edit_descr")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-x-4 gap-y-6 w-full lg:w-1/2 2xl:h-1/3">
        <CustomInput
          size_="md"
          name="username"
          label={t("username")}
          defaultValue={userData.username}
          placeholder={t("enter_user_name")}
          type="text"
          requiredHint={`* ${t("required")}`}
          required={true}
          errorMessage={error.get("username")}
          onBlur={handleChange}
          startContent={
            <UserRound className="text-secondary-foreground size-[18px] pointer-events-none" />
          }
        />
        <CustomInput
          size_="sm"
          name="email"
          requiredHint={`* ${t("required")}`}
          required={true}
          defaultValue={userData.email}
          placeholder={t("enter_your_email")}
          label={t("email")}
          type="email"
          errorMessage={error.get("email")}
          onChange={handleChange}
          startContent={
            <Mail className="text-secondary-foreground size-[18px] pointer-events-none" />
          }
        />

        <CustomPhoneInput
          requiredHint={`* ${t("required")}`}
          required={true}
          label={t("contact")}
          onChange={handleChange}
          value={userData.contact}
          name="contact"
          errorMessage={error.get("contact")}
        />

        <FakeCombobox
          icon={
            <ChevronsUpDown className="size-[16px] absolute top-1/2 transform -translate-y-1/2 ltr:right-4 rtl:left-4" />
          }
          title={t("role")}
          selected={user.role.name}
        />
        <FakeCombobox
          icon={
            <CalendarDays className="size-[16px] text-tertiary absolute top-1/2 transform -translate-y-1/2 ltr:right-4 rtl:left-4" />
          }
          title={t("join_date")}
          selected={toLocaleDate(new Date(user.created_at), state)}
        />
      </CardContent>
      <CardFooter>
        <PrimaryButton
          disabled={loading}
          onClick={saveData}
          className={`shadow-lg`}
        >
          <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
