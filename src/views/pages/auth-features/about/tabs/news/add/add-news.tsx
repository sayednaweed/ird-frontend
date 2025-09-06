import { useTranslation } from "react-i18next";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import CloseButton from "@/components/custom-ui/button/CloseButton";
import Stepper from "@/components/custom-ui/stepper/Stepper";
import CompleteStep from "@/components/custom-ui/stepper/CompleteStep";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { Check, User as UserIcon } from "lucide-react";
import AddNewsInformation from "./steps/add-news-information";
import type { News } from "@/database/models";
import type { Dispatch, SetStateAction } from "react";
import type { ValidateItem } from "@/validation/types";
import { toast } from "sonner";

export interface AddNewsProps {
  onComplete: (news: News) => void;
}
export default function AddNews(props: AddNewsProps) {
  const { onComplete } = props;
  const { t } = useTranslation();
  const { modelOnRequestHide } = useModelOnRequestHide();
  const beforeStepSuccess = async (
    _userData: any,
    _currentStep: number,
    _setError: Dispatch<SetStateAction<Map<string, string>>>
  ) => true;

  const stepsCompleted = async (
    userData: any,
    setError: Dispatch<SetStateAction<Map<string, string>>>
  ) => {
    // 1. Validate visibility_date if visibility_duration is true
    const rules: ValidateItem[] = [];
    if (userData.visibility_duration) {
      rules.push({
        name: "visibility_date",
        rules: ["required"],
      });
    }
    const passed = await validate(rules, userData, setError);
    if (!passed) {
      return false;
    }
    // 2. Send data
    let formData = new FormData();
    if (userData.visibility_date)
      formData.append(
        "visibility_date",
        userData.visibility_date.toDate().toISOString()
      );
    formData.append("title_english", userData.title_english);
    formData.append("title_farsi", userData.title_farsi);
    formData.append("title_pashto", userData.title_pashto);
    formData.append("content_english", userData.content_english);
    formData.append("content_farsi", userData.content_farsi);
    formData.append("content_pashto", userData.content_pashto);
    formData.append("type", userData?.type?.id);
    formData.append("priority", userData?.priority?.id);
    formData.append("date", userData.date.toDate().toISOString());
    formData.append("cover_pic", userData.cover_pic);
    // For optimization
    formData.append("type_name", userData?.type?.value);
    formData.append("priority_name", userData?.priority?.value);
    try {
      const response = await axiosClient.post("newses", formData);
      if (response.status == 200) {
        onComplete(response.data.news);
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
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
        size="wrap-height"
        className="bg-transparent dark:!bg-transparent"
        progressText={{
          complete: t("complete"),
          inProgress: t("in_progress"),
          pending: t("pending"),
          step: t("step"),
        }}
        loadingText={t("loading")}
        backText={t("back")}
        nextText={t("next")}
        confirmText={t("confirm")}
        steps={[
          {
            description: t("detail"),
            icon: <UserIcon className="size-[16px]" />,
          },
          {
            description: t("complete"),
            icon: <Check className="size-[16px]" />,
          },
        ]}
        components={[
          {
            component: <AddNewsInformation />,
            validationRules: [
              {
                name: "title_english",
                rules: ["required", "max:128", "min:12"],
              },
              { name: "title_farsi", rules: ["required", "max:128", "min:12"] },
              {
                name: "title_pashto",
                rules: ["required", "max:128", "min:12"],
              },
              {
                name: "content_english",
                rules: ["required", "min:12"],
              },
              {
                name: "content_farsi",
                rules: ["required", "min:32"],
              },
              {
                name: "content_pashto",
                rules: ["required", "min:12"],
              },
              { name: "type", rules: ["required"] },
              { name: "priority", rules: ["required"] },
              { name: "date", rules: ["required"] },
              { name: "cover_pic", rules: ["required"] },
            ],
          },
          {
            component: (
              <CompleteStep
                successText={t("congratulation")}
                closeText={t("close")}
                againText={t("again")}
                closeModel={closeModel}
                description={t("news_created")}
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
