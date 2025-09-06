import AddUserAccount from "./steps/AddUserAccount";
import AddUserInformation from "./steps/AddUserInformation";
import { useTranslation } from "react-i18next";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import CloseButton from "@/components/custom-ui/button/CloseButton";
import axiosClient from "@/lib/axois-client";
import { setServerError } from "@/validation/validation";
import { Check, Database, User as UserIcon } from "lucide-react";
import { checkStrength, passwordStrengthScore } from "@/lib/utils";
import CompleteStep from "@/components/custom-ui/stepper/CompleteStep";
import Stepper from "@/components/custom-ui/stepper/Stepper";
import type { User } from "@/database/models";
import { toast } from "sonner";
import type { Dispatch, SetStateAction } from "react";

export interface AddUserProps {
  onComplete: (user: User) => void;
}
export default function AddUser(props: AddUserProps) {
  const { onComplete } = props;
  const { t } = useTranslation();
  const { modelOnRequestHide } = useModelOnRequestHide();
  const beforeStepSuccess = async (
    userData: any,
    currentStep: number,
    setError: Dispatch<SetStateAction<Map<string, string>>>
  ) => {
    if (currentStep == 1) {
      try {
        let formData = new FormData();
        formData.append("email", userData?.email);
        formData.append("contact", userData?.contact);
        const response = await axiosClient.post("contacts/exist", formData);
        if (response.status == 200) {
          const emailExist = response.data.email_found === true;
          const contactExist = response.data.contact_found === true;
          if (emailExist || contactExist) {
            const errMap = new Map<string, string>();
            if (emailExist) {
              errMap.set("email", `${t("email")} ${t("is_registered_before")}`);
            }
            if (contactExist) {
              errMap.set(
                "contact",
                `${t("contact")} ${t("is_registered_before")}`
              );
            }
            setError(errMap);
            return false;
          }
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message);

        console.log(error);
        return false;
      }
    }
    return true;
  };
  const stepsCompleted = async (
    userData: any,
    setError: Dispatch<SetStateAction<Map<string, string>>>
  ) => {
    try {
      const response = await axiosClient.post("users", {
        permissions: userData?.permissions,
        role: userData.role.id,
        job: userData.job.name,
        job_id: userData.job.id,
        division: userData.division.name,
        division_id: userData.division.id,
        contact: userData.contact?.length > 6 ? userData.contact : undefined,
        password: userData.password,
        email: userData.email,
        username: userData.username,
        full_name: userData.full_name,
      });
      if (response.status == 200) {
        onComplete(response.data.user);
        toast.success(response?.data?.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);

      setServerError(error.response.data.errors, setError);
      console.log(error);
      return false;
    }
    return true;
  };
  const closeModel = () => {
    modelOnRequestHide();
  };

  return (
    <div className="pt-4">
      {/* Header */}
      <div className="flex px-1 py-1 fixed w-full justify-end">
        <CloseButton dismissModel={closeModel} />
      </div>
      {/* Body */}
      <Stepper
        isCardActive={true}
        size="lg"
        className="bg-transparent dark:!bg-transparent"
        progressText={{
          complete: t("complete"),
          inProgress: t("in_progress"),
          pending: t("pending"),
          step: t("step"),
        }}
        loadingText={t("store_infor")}
        backText={t("back")}
        nextText={t("next")}
        confirmText={t("confirm")}
        steps={[
          {
            description: t("personal_details"),
            icon: <UserIcon className="size-[16px]" />,
          },
          {
            description: t("account_information"),
            icon: <Database className="size-[16px]" />,
          },
          {
            description: t("complete"),
            icon: <Check className="size-[16px]" />,
          },
        ]}
        components={[
          {
            component: <AddUserInformation />,
            validationRules: [
              { name: "full_name", rules: ["required", "max:45", "min:3"] },
              { name: "username", rules: ["required", "max:45", "min:3"] },
              { name: "email", rules: ["required"] },
              { name: "division", rules: ["required"] },
              { name: "job", rules: ["required"] },
            ],
          },
          {
            component: <AddUserAccount />,
            validationRules: [
              {
                name: "password",
                rules: [
                  (value: any) => {
                    const strength = checkStrength(value, t);
                    const score = passwordStrengthScore(strength);
                    if (score === 4) return true;
                    return false;
                  },
                ],
              },
              { name: "role", rules: ["required"] },
            ],
          },
          {
            component: (
              <CompleteStep
                successText={t("congratulation")}
                closeText={t("close")}
                againText={t("again")}
                closeModel={closeModel}
                description={t("user_acc_crea")}
              />
            ),
            validationRules: [],
          },
        ]}
        beforeStepSuccess={beforeStepSuccess}
        stepsCompleted={stepsCompleted}
      />
    </div>
  );
}
