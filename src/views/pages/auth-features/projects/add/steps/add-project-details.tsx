import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import ConfirmationDialog from "@/components/custom-ui/dialog/confirmation-dialog";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { TaskTypeEnum } from "@/database/model-enums";
import { useScrollToElement } from "@/hook/use-scroll-to-element";
import axiosClient from "@/lib/axois-client";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
interface AddProjectDetailsProps {
  fetchUrl: string;
  type: "extend" | "register";
}
export default function AddProjectDetails(props: AddProjectDetailsProps) {
  const { t } = useTranslation();
  const { fetchUrl } = props;
  let { id } = useParams();
  const navigate = useNavigate();
  const { userData, setUserData, error } = useContext(StepperContext);
  useScrollToElement(error);

  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`${fetchUrl}${id}`);
      if (response.status == 200) {
        let content = response.data.content;
        // Ask if user wants to resume prevoius operation
        if (content) {
          content = JSON.parse(content);
          setUserData({
            ...content,
            allowed: true,
            shouldContinue: false,
            checklistMap: content.checklistMap
              ? new Map(content.checklistMap)
              : new Map<string, any>(),
          });
        } else {
          // no data is stored
          setUserData((prev: any) => ({
            ...prev,
            allowed: true,
            shouldContinue: true,
            checklistMap: new Map<string, any>(),
          }));
        }
      }
    } catch (error: any) {
      toast.error(t("error"));
      console.log(error);
      navigate("/unauthorized", { replace: true });
    }
  };
  useEffect(() => {
    if (userData.shouldContinue == undefined) fetchData();
  }, []);

  return userData?.shouldContinue == false ? (
    <ConfirmationDialog
      onComplete={async (clearState: boolean, _response: any) => {
        if (clearState) {
          setUserData({
            allowed: true,
            shouldContinue: true,
            checklistMap: new Map<string, any>(),
          });
        } else {
          setUserData((prev: any) => ({
            ...prev,
            allowed: true,
            shouldContinue: true,
          }));
        }
      }}
      params={{
        task_type: TaskTypeEnum.project_registeration,
      }}
      url={"projects/pending-task/" + id}
    />
  ) : userData?.allowed ? (
    <div className="flex flex-col mt-10 w-full 2xl:w-[60%] gap-y-6 pb-12">
      <BorderContainer
        title={t("project_name")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-y-3"
      >
        <MultiTabInput
          optionalKey={"optional_lang"}
          onTabChanged={(key: string, tabName: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="project_name"
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="preamble"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="abbreviat"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="organization_sen_man"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="exper_in_health"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="project_intro"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="goals"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="objective"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="expected_outcome"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="expected_impact"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="main_activities"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
            setUserData((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setUserData((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="action_plan"
          rows={8}
          highlightColor="bg-tertiary"
          userData={userData}
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
    </div>
  ) : (
    <NastranSpinner />
  );
}
