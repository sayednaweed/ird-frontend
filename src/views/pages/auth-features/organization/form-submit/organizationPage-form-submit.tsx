import { useTranslation } from "react-i18next";
import Stepper from "@/components/custom-ui/stepper/Stepper";
import axiosClient from "@/lib/axois-client";
import { Check, Database, Grip, NotebookPen, UserRound } from "lucide-react";
import MoreInformationTab from "./steps/more-information-tab";
import { useNavigate, useParams } from "react-router";
import CheckListTab from "./steps/checklist-tab";
import { isString } from "@/lib/utils";
import { setServerError } from "@/validation/validation";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import DirectorInformationSubmitTab from "./steps/director-information-submit-tab";

import CompleteStep from "@/components/custom-ui/stepper/CompleteStep";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { RoleEnum, StatusEnum, TaskTypeEnum } from "@/database/model-enums";
import { toast } from "sonner";
import ServerError from "@/components/custom-ui/resuseable/server-error";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import OrganizationInformationTab from "@/views/pages/auth-features/organization/form-submit/steps/organization-information-tab";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import type { Organization } from "@/database/models";

export default function OrganizationFormSubmit() {
  const { user, setUser } = useGeneralAuthState();
  const { t } = useTranslation();
  let { id } = useParams();
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);
  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`organizations/status/${id}`);
      if (response.status == 200) {
        const data = response.data;
        if (data.status_id == StatusEnum.registration_incomplete) {
          setAllowed(true);
        } else {
          navigate("/unauthorized", { replace: true });
        }
      }
    } catch (error: any) {
      toast.error(t("error"));
      console.log(error);
      navigate("/unauthorized", { replace: true });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const SaveContent = async (formData: FormData) => {
    try {
      const response = await axiosClient.post(`pending-tasks/${id}`, formData);
      if (response.status == 200) {
        return true;
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    }
    return false;
  };
  const beforeStepSuccess = async (
    _userData: any,
    _currentStep: number,
    _setError: Dispatch<SetStateAction<Map<string, string>>>,
    _backClicked: boolean
  ) => {
    return true;
  };

  const stepsCompleted = async (
    userData: any,
    setError: Dispatch<SetStateAction<Map<string, string>>>
  ) => {
    let formData = new FormData();
    try {
      const content = {
        ...userData, // shallow copy of the userData object
        checklistMap: Array.from(userData.checklistMap),
        establishment_date: !isString(userData.establishment_date)
          ? userData.establishment_date?.toDate()?.toISOString()
          : userData.establishment_date,
      };

      if (id) formData.append("organization_id", id.toString());
      formData.append("content", JSON.stringify(content));

      const response = await axiosClient.post(
        "organizations/register/form",
        formData
      );

      if (response.status == 200) {
        if (user.role.role == RoleEnum.organization) {
          const organization = user as Organization;
          organization.agreement_status_id = response.data.agreement_status_id;
          organization.agreement_status = response.data.agreement_status;
          setUser(organization);
        }
        return true;
      }
    } catch (error: any) {
      toast.error(<ServerError errors={error.response.data.errors} />);
      setServerError(error.response.data.errors, setError);

      return false;
    }
    return true;
  };

  const onSaveClose = async (
    userData: any,
    currentStep: number,
    onlySave: boolean
  ) => {
    const content = {
      ...userData, // shallow copy of the userData object
      checklistMap: Array.from(userData.checklistMap),
      establishment_date: !isString(userData.establishment_date)
        ? userData.establishment_date?.toDate()?.toISOString()
        : userData.establishment_date,
    };
    let formData = new FormData();
    formData.append("contents", JSON.stringify(content));
    formData.append("step", currentStep.toString());
    formData.append(
      "task_type",
      TaskTypeEnum.organization_registeration.toString()
    );
    if (id) formData.append("id", id.toString());
    await SaveContent(formData);
    if (!onlySave) onClose();
  };
  const handleGoBack = () => navigate("/dashboard/profile");
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const onClose = () => {
    navigate(`/dashboard/organizations/${user.id}`, { replace: true });
  };
  return (
    <div className="p-2">
      {allowed ? (
        <>
          <Breadcrumb>
            <BreadcrumbHome onClick={handleGoHome} />
            <BreadcrumbSeparator />
            <BreadcrumbItem onClick={handleGoBack}>{t("back")}</BreadcrumbItem>
          </Breadcrumb>
          <Stepper
            isCardActive={true}
            size="wrap-height"
            className="mt-3 overflow-y-auto overflow-x-hidden"
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
                icon: <Database className="size-[16px]" />,
              },
              {
                description: t("director"),
                icon: <UserRound className="size-[16px]" />,
              },
              {
                description: t("more_information"),
                icon: <Grip className="size-[16px]" />,
              },
              {
                description: t("checklist"),
                icon: <NotebookPen className="size-[16px]" />,
              },
              {
                description: t("complete"),
                icon: <Check className="size-[16px]" />,
              },
            ]}
            components={[
              {
                component: (
                  <OrganizationInformationTab
                    type="register"
                    fetchUrl={"organizations/register/form/"}
                  />
                ),
                validationRules: [
                  {
                    name: "name_english",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "name_farsi",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "name_pashto",
                    rules: ["required", "max:128", "min:3"],
                  },
                  { name: "abbr", rules: ["required"] },
                  { name: "type", rules: ["required"] },
                  { name: "contact", rules: ["required"] },
                  { name: "email", rules: ["required"] },
                  { name: "country", rules: ["required"] },
                  { name: "establishment_date", rules: ["required"] },
                  { name: "province", rules: ["required"] },
                  { name: "district", rules: ["required"] },
                  {
                    name: "area_english",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "area_pashto",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "area_farsi",
                    rules: ["required", "max:128", "min:3"],
                  },
                ],
              },
              {
                component: <DirectorInformationSubmitTab />,
                validationRules: [
                  {
                    name: "director_name_english",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "director_name_farsi",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "director_name_pashto",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "surname_english",
                    rules: ["required", "max:128", "min:2"],
                  },
                  {
                    name: "surname_pashto",
                    rules: ["required", "max:128", "min:2"],
                  },
                  {
                    name: "surname_farsi",
                    rules: ["required", "max:128", "min:2"],
                  },
                  {
                    name: "director_contact",
                    rules: ["required"],
                  },
                  {
                    name: "director_email",
                    rules: ["required"],
                  },
                  {
                    name: "gender",
                    rules: ["required"],
                  },
                  {
                    name: "nationality",
                    rules: ["required"],
                  },
                  {
                    name: "identity_type",
                    rules: ["required"],
                  },
                  {
                    name: "nid",
                    rules: ["required"],
                  },
                  {
                    name: "director_province",
                    rules: ["required"],
                  },
                  {
                    name: "director_dis",
                    rules: ["required"],
                  },
                  {
                    name: "director_area_english",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "director_area_farsi",
                    rules: ["required", "max:128", "min:3"],
                  },
                  {
                    name: "director_area_pashto",
                    rules: ["required", "max:128", "min:3"],
                  },
                ],
              },
              {
                component: <MoreInformationTab />,
                validationRules: [
                  { name: "vision_english", rules: ["required", "min:10"] },
                  { name: "vision_farsi", rules: ["required", "min:10"] },
                  { name: "vision_pashto", rules: ["required", "min:10"] },
                  { name: "mission_english", rules: ["required", "min:10"] },
                  { name: "mission_farsi", rules: ["required", "min:10"] },
                  { name: "mission_pashto", rules: ["required", "min:10"] },
                  {
                    name: "general_objes_english",
                    rules: ["required", "min:10"],
                  },
                  {
                    name: "general_objes_farsi",
                    rules: ["required", "min:10"],
                  },
                  {
                    name: "general_objes_pashto",
                    rules: ["required", "min:10"],
                  },
                  {
                    name: "objes_in_afg_english",
                    rules: ["required", "min:10"],
                  },
                  { name: "objes_in_afg_farsi", rules: ["required", "min:10"] },
                  {
                    name: "objes_in_afg_pashto",
                    rules: ["required", "min:10"],
                  },
                ],
              },
              {
                component: (
                  <CheckListTab onSaveClose={onSaveClose} type="register" />
                ),
                validationRules: [],
              },
              {
                component: (
                  <CompleteStep
                    successText={t("congratulation")}
                    closeText={t("close")}
                    closeModel={onClose}
                    description={t("info_stored")}
                  />
                ),
                validationRules: [],
              },
            ]}
            beforeStepSuccess={beforeStepSuccess}
            stepsCompleted={stepsCompleted}
            onSaveClose={(userData: any, currentStep: number) =>
              onSaveClose(userData, currentStep, false)
            }
            onSaveCloseText={t("save_close")}
          />
        </>
      ) : (
        <NastranSpinner label={t("check_auth")} className="mt-16" />
      )}
    </div>
  );
}
