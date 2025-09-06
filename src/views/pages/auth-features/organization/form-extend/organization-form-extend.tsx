import { useTranslation } from "react-i18next";
import Stepper from "@/components/custom-ui/stepper/Stepper";
import axiosClient from "@/lib/axois-client";
import {
  Check,
  Database,
  Grip,
  NotebookPen,
  UserRound,
  UsersRound,
} from "lucide-react";

import { useNavigate, useParams } from "react-router";
import { isString } from "@/lib/utils";
import { setServerError } from "@/validation/validation";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import DirectorInformationExtendTab from "./steps/director-information-extend-tab";

import RepresenterExtendTab from "./steps/representer-extend";
import MoreInformationTab from "../form-submit/steps/more-information-tab";
import CheckListTab from "../form-submit/steps/checklist-tab";
import CompleteStep from "@/components/custom-ui/stepper/CompleteStep";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
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

export default function OrganizationFormExtend() {
  const { t } = useTranslation();
  let { id } = useParams();
  const navigate = useNavigate();
  const { user } = useGeneralAuthState();
  const [allowed, setAllowed] = useState(false);
  const handleGoBack = () => navigate(-1);
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`organization/status/${id}`);
      if (response.status == 200) {
        const data = response.data;
        if (data.status_type_id == StatusEnum.expired) {
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
      const response = await axiosClient.post(
        `store/task/with/content/${id}`,
        formData
      );
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
        "organization/extend/form/complete",
        formData
      );

      if (response.status == 200) {
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
      TaskTypeEnum.organization_agreement_extend.toString()
    );
    if (id) formData.append("id", id.toString());
    await SaveContent(formData);
    if (!onlySave) onClose();
  };
  const onClose = () => {
    if (user.role.role == RoleEnum.organization) {
      // Incase of organization
      navigate("/dashboard", { replace: true });
    } else {
      // Back to organization information
      navigate(-1);
    }
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
                description: t("representative"),
                icon: <UsersRound className="size-[16px]" />,
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
                    type="extend"
                    fetchUrl={"organization/start/extend/form/"}
                  />
                ),
                validationRules: [
                  {
                    name: "name_english",
                    rules: ["required", "max:128", "min:5"],
                  },
                  {
                    name: "name_farsi",
                    rules: ["required", "max:128", "min:5"],
                  },
                  {
                    name: "name_pashto",
                    rules: ["required", "max:128", "min:5"],
                  },
                  { name: "abbr", rules: ["required"] },
                  { name: "type", rules: ["required"] },
                  { name: "contact", rules: ["required"] },
                  { name: "email", rules: ["required"] },
                  { name: "moe_registration_no", rules: ["required"] },
                  { name: "country", rules: ["required"] },
                  { name: "establishment_date", rules: ["required"] },
                  { name: "province", rules: ["required"] },
                  { name: "district", rules: ["required"] },
                  {
                    name: "area_english",
                    rules: ["required", "max:128", "min:5"],
                  },
                  {
                    name: "area_pashto",
                    rules: ["required", "max:128", "min:5"],
                  },
                  {
                    name: "area_farsi",
                    rules: ["required", "max:128", "min:5"],
                  },
                ],
              },
              {
                component: <DirectorInformationExtendTab />,
                validationRules: [
                  {
                    name: "new_director",
                    rules: ["required"],
                  },
                  {
                    name: "prev_dire",
                    rules: ["requiredIf:new_director:false"],
                  },
                  {
                    name: "director_name_english",
                    rules: ["requiredIf:new_director:true", "max:128", "min:3"],
                  },
                  {
                    name: "director_name_farsi",
                    rules: ["requiredIf:new_director:true", "max:128", "min:3"],
                  },
                  {
                    name: "director_name_pashto",
                    rules: ["requiredIf:new_director:true", "max:128", "min:3"],
                  },
                  {
                    name: "surname_english",
                    rules: ["requiredIf:new_director:true", "max:128", "min:2"],
                  },
                  {
                    name: "surname_pashto",
                    rules: ["requiredIf:new_director:true", "max:128", "min:2"],
                  },
                  {
                    name: "surname_farsi",
                    rules: ["requiredIf:new_director:true", "max:128", "min:2"],
                  },
                  {
                    name: "director_contact",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "director_email",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "gender",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "nationality",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "identity_type",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "nid",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "director_province",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "director_dis",
                    rules: ["requiredIf:new_director:true"],
                  },
                  {
                    name: "director_area_english",
                    rules: ["requiredIf:new_director:true", "max:128", "min:5"],
                  },
                  {
                    name: "director_area_farsi",
                    rules: ["requiredIf:new_director:true", "max:128", "min:5"],
                  },
                  {
                    name: "director_area_pashto",
                    rules: ["requiredIf:new_director:true", "max:128", "min:5"],
                  },
                ],
              },
              {
                component: <RepresenterExtendTab />,
                validationRules: [
                  {
                    name: "new_represent",
                    rules: ["required"],
                  },
                  {
                    name: "prev_rep",
                    rules: ["requiredIf:new_represent:false"],
                  },
                  {
                    name: "repre_name_english",
                    rules: [
                      "requiredIf:new_represent:true",
                      "max:128",
                      "min:3",
                    ],
                  },
                  {
                    name: "repre_name_pashto",
                    rules: [
                      "requiredIf:new_represent:true",
                      "max:128",
                      "min:3",
                    ],
                  },
                  {
                    name: "repre_name_farsi",
                    rules: [
                      "requiredIf:new_represent:true",
                      "max:128",
                      "min:3",
                    ],
                  },
                ],
              },
              {
                component: (
                  <MoreInformationTab
                    url={`organization/more-information/${id}`}
                  />
                ),
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
                  <CheckListTab onSaveClose={onSaveClose} type="extend" />
                ),
                validationRules: [],
              },
              {
                component: (
                  <CompleteStep
                    successText={t("congratulation")}
                    closeText={t("close")}
                    closeModel={onClose}
                    description={t("extend_success")}
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
