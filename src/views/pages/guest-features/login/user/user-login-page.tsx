import * as React from "react";
import { Eye, EyeOff, Mail } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { validate } from "@/validation/validation";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import AnimatedUserIcon from "@/components/custom-ui/icons/animated-user-icon";
import { toast } from "sonner";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import { RoleEnum } from "@/database/model-enums";

export interface UserLoginPageProps {
  role_id: number;
  title: string;
}
export default function UserLoginPage(props: UserLoginPageProps) {
  const { role_id, title } = props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginUser, loginOrganization } = useGeneralAuthState();
  const [userData, setUserData] = React.useState<any>({});
  const [error, setError] = React.useState<Map<string, string>>(new Map());
  const [loading, setLoading] = React.useState(false);
  // Password input
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);
  const onFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    // 1. Validate before submission
    const result: boolean = await validate(
      [
        { name: "email", rules: ["required"] },
        { name: "password", rules: ["required", "max:45", "min:8"] },
      ],
      userData,
      setError
    );
    if (!result) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // 2. Attempt login
    const response: any =
      role_id == RoleEnum.organization
        ? await loginOrganization(userData.email, userData.password, true)
        : await loginUser(userData.email, userData.password, true);
    if (response.status == 200) {
      toast.success(t("success"));
      navigate("/dashboard", { replace: true });
    } else {
      console.log(response);
      toast.error(response?.response?.data?.message);
    }

    setLoading(false);
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div className="px-6 sm:px-16 pb-16 flex flex-col items-center h-screen pt-12">
      <div className="shadow-primary-box-shadow bg-tertiary w-fit rounded-full p-4">
        <AnimatedUserIcon />
      </div>
      <h1 className="drop-shadow-lg my-3 text-center relative text-tertiary uppercase text-[20px] sm:text-[26px] mb-8 font-bold">
        {t(title)}
      </h1>
      <form
        className="flex flex-col space-y-3 w-full sm:w-[400px]"
        onSubmit={onFormSubmit}
      >
        <CustomInput
          size_="sm"
          placeholder={t("enter_your_email")}
          type="email"
          name="email"
          dir="ltr"
          className="rtl:text-right"
          errorMessage={error.get("email")}
          onChange={handleChange}
          startContent={
            <Mail className="text-primary size-[20px] pointer-events-none" />
          }
        />
        <CustomInput
          size_="sm"
          name="password"
          onChange={handleChange}
          placeholder={t("enter_password")}
          errorMessage={error.get("password")}
          startContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={toggleVisibility}
            >
              {isVisible ? (
                <Eye className="size-[20px] text-primary-icon pointer-events-none" />
              ) : (
                <EyeOff className="size-[20px] text-primary-icon pointer-events-none" />
              )}
            </button>
          }
          type={isVisible ? "text" : "password"}
        />
        <PrimaryButton
          disabled={loading}
          className={`w-full py-6 uppercase ${loading && "opacity-90"}`}
          type="submit"
        >
          <ButtonSpinner
            loading={loading}
            className="rtl:text-2xl-rtl ltr:text-2xl-ltr"
          >
            {t("login")}
          </ButtonSpinner>
        </PrimaryButton>
      </form>
    </div>
  );
}
