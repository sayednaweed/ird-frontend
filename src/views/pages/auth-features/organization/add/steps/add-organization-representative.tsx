import CheckListChooser from "@/components/custom-ui/chooser/CheckListChooser";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { ChecklistEnum, TaskTypeEnum } from "@/database/model-enums";
import axiosClient from "@/lib/axois-client";
import type { FileType } from "@/lib/types";
import { getConfiguration, validateFile } from "@/lib/utils";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function AddOrganizationRepresentative() {
  const { t } = useTranslation();
  const { userData, setUserData, error } = useContext(StepperContext);
  const fetch = async () => {
    try {
      const response = await axiosClient.get(`checklists/representative`);
      if (response.status === 200) {
        setUserData((prev: any) => ({
          ...prev,
          validationChecklist: response.data,
        }));
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (!userData?.validationChecklist) fetch();
  }, []);
  return !userData?.validationChecklist ? (
    <NastranSpinner />
  ) : (
    <div className="flex flex-col mt-10 w-full lg:w-[80%] gap-y-6 pb-12">
      <BorderContainer
        title={t("representative")}
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
          name="repre_name"
          highlightColor="bg-tertiary"
          userData={userData}
          errorData={error}
          placeholder={t("name")}
          className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
          tabsClassName="gap-x-5 px-3"
        >
          <SingleTab>english</SingleTab>
          <SingleTab>farsi</SingleTab>
          <SingleTab>pashto</SingleTab>
        </MultiTabInput>
      </BorderContainer>

      <div className="mt-2">
        <CheckListChooser
          number={undefined}
          donwloadUrl={`media/temporary`}
          hasEdit={true}
          url={`${
            import.meta.env.VITE_API_BASE_URL
          }/api/v1/single/checklist/file/upload`}
          headers={{
            "X-API-KEY": import.meta.env.VITE_BACK_END_API_TOKEN,
            "X-SERVER-ADDR": import.meta.env.VITE_BACK_END_API_IP,
            Authorization: "Bearer " + getConfiguration()?.token,
          }}
          name={t("letter_of_intro")}
          defaultFile={userData.letter_of_intro as FileType}
          uploadParam={{
            checklist_id: ChecklistEnum.organization_representor_letter,
            task_type: TaskTypeEnum.organization_registeration,
          }}
          accept={userData.validationChecklist.acceptable_mimes}
          onComplete={async (record: any) => {
            for (const element of record) {
              const checklist = element[element.length - 1];
              setUserData((prev: any) => ({
                ...prev,
                letter_of_intro: checklist,
              }));
            }
          }}
          onFailed={async (failed: boolean, response: any) => {
            if (failed) {
              if (response) {
                toast.error(response.data.message);
                setUserData((prev: any) => ({
                  ...prev,
                  letter_of_intro: undefined,
                }));
              }
            }
          }}
          onStart={async (_file: File) => {}}
          validateBeforeUpload={function (file: File): boolean {
            const maxFileSize = userData.validationChecklist.file_size * 1024; // 2MB
            const validTypes: string[] =
              userData.validationChecklist.acceptable_mimes.split(",");
            const resultFile = validateFile(
              file,
              Math.round(maxFileSize),
              validTypes,
              t
            );
            return resultFile ? true : false;
          }}
        />
        {error.get("letter_of_intro") && (
          <h1 className="rtl:text-md-rtl ltr:text-sm-ltr px-2 capitalize text-start text-red-400">
            {error.get("letter_of_intro")}
          </h1>
        )}
      </div>
    </div>
  );
}
