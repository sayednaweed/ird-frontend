import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
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
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useParams } from "react-router";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import { toast } from "sonner";
import type { ValidateItem } from "@/validation/types";
import type { ProjectDetailType } from "@/database/models";

interface EditDetailsTabProps {
  hasEdit: boolean;
}
export default function EditDetailsTab(props: EditDetailsTabProps) {
  const { hasEdit } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const [projectDetail, setProjectDetail] = useState<
    ProjectDetailType | undefined
  >(undefined);

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`projects/details/${id}`);
      if (response.status == 200) {
        setProjectDetail(response.data);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
      setFailed(true);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadInformation();
  }, []);

  const saveData = async () => {
    if (loading || id === undefined) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // 1. Validate data changes
    // 2. Validate form
    const compulsoryFields: ValidateItem[] = [
      { name: "project_name_english", rules: ["required", "max:128"] },
      { name: "project_name_farsi", rules: ["required", "max:128"] },
      { name: "project_name_pashto", rules: ["required", "max:128"] },
      { name: "preamble_english", rules: ["required"] },
      { name: "preamble_farsi", rules: ["required"] },
      { name: "preamble_pashto", rules: ["required"] },
      { name: "abbreviat_english", rules: ["required"] },
      { name: "abbreviat_farsi", rules: ["required"] },
      { name: "abbreviat_pashto", rules: ["required"] },
      { name: "organization_sen_man_english", rules: ["required"] },
      { name: "organization_sen_man_farsi", rules: ["required"] },
      { name: "organization_sen_man_pashto", rules: ["required"] },
      { name: "exper_in_health_english", rules: ["required"] },
      { name: "exper_in_health_farsi", rules: ["required"] },
      { name: "exper_in_health_pashto", rules: ["required"] },
      { name: "project_intro_english", rules: ["required"] },
      { name: "project_intro_farsi", rules: ["required"] },
      { name: "project_intro_pashto", rules: ["required"] },
      { name: "goals_english", rules: ["required"] },
      { name: "goals_farsi", rules: ["required"] },
      { name: "goals_pashto", rules: ["required"] },
      { name: "objective_english", rules: ["required"] },
      { name: "objective_farsi", rules: ["required"] },
      { name: "objective_pashto", rules: ["required"] },
      { name: "expected_outcome_english", rules: ["required"] },
      { name: "expected_outcome_farsi", rules: ["required"] },
      { name: "expected_outcome_pashto", rules: ["required"] },
      { name: "expected_impact_english", rules: ["required"] },
      { name: "expected_impact_farsi", rules: ["required"] },
      { name: "expected_impact_pashto", rules: ["required"] },
      { name: "main_activities_english", rules: ["required"] },
      { name: "main_activities_farsi", rules: ["required"] },
      { name: "main_activities_pashto", rules: ["required"] },
      { name: "action_plan_english", rules: ["required"] },
      { name: "action_plan_farsi", rules: ["required"] },
      { name: "action_plan_pashto", rules: ["required"] },
    ];
    const passed = await validate(compulsoryFields, projectDetail, setError);
    if (!passed) {
      setLoading(false);
      return;
    }
    // 2. Store
    try {
      const response = await axiosClient.put("projects/details", {
        id: id,
        project_name_english: projectDetail?.project_name_english,
        project_name_farsi: projectDetail?.project_name_farsi,
        project_name_pashto: projectDetail?.project_name_pashto,
        preamble_english: projectDetail?.preamble_english,
        preamble_farsi: projectDetail?.preamble_farsi,
        preamble_pashto: projectDetail?.preamble_pashto,
        abbreviat_english: projectDetail?.abbreviat_english,
        abbreviat_farsi: projectDetail?.abbreviat_farsi,
        abbreviat_pashto: projectDetail?.abbreviat_pashto,
        organization_sen_man_english:
          projectDetail?.organization_sen_man_english,
        organization_sen_man_farsi: projectDetail?.organization_sen_man_farsi,
        organization_sen_man_pashto: projectDetail?.organization_sen_man_pashto,
        exper_in_health_english: projectDetail?.exper_in_health_english,
        exper_in_health_farsi: projectDetail?.exper_in_health_farsi,
        exper_in_health_pashto: projectDetail?.exper_in_health_pashto,
        project_intro_english: projectDetail?.project_intro_english,
        project_intro_farsi: projectDetail?.project_intro_farsi,
        project_intro_pashto: projectDetail?.project_intro_pashto,
        goals_english: projectDetail?.goals_english,
        goals_farsi: projectDetail?.goals_farsi,
        goals_pashto: projectDetail?.goals_pashto,
        objective_english: projectDetail?.objective_english,
        objective_farsi: projectDetail?.objective_farsi,
        objective_pashto: projectDetail?.objective_pashto,
        expected_outcome_english: projectDetail?.expected_outcome_english,
        expected_outcome_farsi: projectDetail?.expected_outcome_farsi,
        expected_outcome_pashto: projectDetail?.expected_outcome_pashto,
        expected_impact_english: projectDetail?.expected_impact_english,
        expected_impact_farsi: projectDetail?.expected_impact_farsi,
        expected_impact_pashto: projectDetail?.expected_impact_pashto,
        main_activities_english: projectDetail?.main_activities_english,
        main_activities_farsi: projectDetail?.main_activities_farsi,
        main_activities_pashto: projectDetail?.main_activities_pashto,
        action_plan_english: projectDetail?.action_plan_english,
        action_plan_farsi: projectDetail?.action_plan_farsi,
        action_plan_pashto: projectDetail?.action_plan_pashto,
      });
      if (response.status == 200) {
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
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("detail")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_proj_info")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col mt-10 w-full gap-y-6 pb-12">
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : projectDetail === undefined ? (
          <NastranSpinner />
        ) : (
          <>
            <BorderContainer
              title={t("project_name")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabInput
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="project_name"
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabInput>
            </BorderContainer>
            <BorderContainer
              title={t("preamble")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="preamble"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("abbreviat")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="abbreviat"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("organization_sen_man")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="organization_sen_man"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("exper_in_health")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="exper_in_health"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("project_intro")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="project_intro"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("goals")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="goals"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("objective")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="objective"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("expected_outcome")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="expected_outcome"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("expected_impact")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="expected_impact"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("main_activities")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="main_activities"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
            <BorderContainer
              title={t("action_plan")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setProjectDetail((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="action_plan"
                rows={8}
                highlightColor="bg-tertiary"
                userData={projectDetail}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            </BorderContainer>
          </>
        )}
      </CardContent>
      <CardFooter>
        {failed ? (
          <PrimaryButton
            onClick={async () => await loadInformation()}
            className="bg-red-500 hover:bg-red-500/70"
          >
            {t("failed_retry")}
            <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
          </PrimaryButton>
        ) : (
          projectDetail &&
          hasEdit && (
            <PrimaryButton onClick={saveData} className={`shadow-lg`}>
              <ButtonSpinner loading={loading}>{t("update")}</ButtonSpinner>
            </PrimaryButton>
          )
        )}
      </CardFooter>
    </Card>
  );
}
