import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { useParams } from "react-router";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import type { ProjectManager } from "@/database/models";
import type { ProjectOrganizationStructureType } from "@/lib/types";
import { toast } from "sonner";
import type { ValidateItem } from "@/validation/types";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import { Button } from "@/components/ui/button";

export interface EdirOrgStructureDialogProps {
  onComplete: (projectManager: ProjectManager) => void;
  hasEdit?: boolean;
}
export default function EdirOrgStructureDialog(
  props: EdirOrgStructureDialogProps
) {
  const { hasEdit, onComplete } = props;
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  let { id } = useParams();
  const [storing, setStoring] = useState(false);
  const [projectStruction, setProjectStruction] = useState<
    ProjectOrganizationStructureType | any
  >([]);
  const [error, setError] = useState<Map<string, string>>(new Map());

  const saveData = async () => {
    if (storing || id === undefined) {
      setStoring(false);
      return;
    }
    setStoring(true);
    // 2. Validate form
    const compulsoryFields: ValidateItem[] = [
      {
        name: "manager",
        rules: [
          (userData: any) => {
            if (userData?.previous_manager) {
              if (!userData?.manager) {
                return true;
              }
            }
            return false;
          },
        ],
      },
      {
        name: "pro_manager_name_english",
        rules: [
          (userData: any) => {
            if (!userData?.previous_manager) {
              if (
                !userData?.pro_manager_name_english ||
                userData?.pro_manager_name_english?.trim() == ""
              ) {
                return true;
              }
            }
            return false;
          },
        ],
      },
      {
        name: "pro_manager_name_farsi",
        rules: [
          (userData: any) => {
            if (!userData?.previous_manager) {
              if (
                !userData?.pro_manager_name_farsi ||
                userData?.pro_manager_name_farsi?.trim() == ""
              ) {
                return true;
              }
            }
            return false;
          },
        ],
      },
      {
        name: "pro_manager_name_pashto",
        rules: [
          (userData: any) => {
            if (!userData?.previous_manager) {
              if (
                !userData?.pro_manager_name_pashto ||
                userData?.pro_manager_name_pashto?.trim() == ""
              ) {
                return true;
              }
            }
            return false;
          },
        ],
      },
      {
        name: "pro_manager_contact",
        rules: [
          (userData: any) => {
            if (!userData?.previous_manager) {
              if (
                !userData?.pro_manager_contact ||
                userData?.pro_manager_contact?.trim() == ""
              ) {
                return true;
              }
            }
            return false;
          },
        ],
      },
      {
        name: "pro_manager_email",
        rules: [
          (userData: any) => {
            if (!userData?.previous_manager) {
              if (
                !userData?.pro_manager_email ||
                userData?.pro_manager_email?.trim() == ""
              ) {
                return true;
              }
            }
            return false;
          },
        ],
      },
    ];
    const passed = await validate(compulsoryFields, projectStruction, setError);
    if (!passed) {
      setStoring(false);
      return;
    }

    // 2. Store
    try {
      const response = await axiosClient.put("projects/structure", {
        id: id,
        previous_manager: projectStruction?.previous_manager,
        pro_manager_email: projectStruction?.pro_manager_email,
        pro_manager_contact: projectStruction?.pro_manager_contact,
        pro_manager_name_pashto: projectStruction?.pro_manager_name_pashto,
        pro_manager_name_farsi: projectStruction?.pro_manager_name_farsi,
        pro_manager_name_english: projectStruction?.pro_manager_name_english,
        manager: projectStruction?.manager?.id,
      });
      if (response.status == 200) {
        toast.success(response.data.message);
        onComplete(response.data.manager);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setProjectStruction((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };
  const projectManager = projectStruction?.previous_manager ? (
    <APICombobox
      placeholderText={t("search_item")}
      errorText={t("no_item")}
      onSelect={(selection: any) =>
        setProjectStruction((prev: any) => ({
          ...prev,
          ["manager"]: selection,
        }))
      }
      lable={t("manager")}
      required={true}
      requiredHint={`* ${t("required")}`}
      selectedItem={projectStruction["manager"]?.name}
      placeHolder={t("select_a")}
      errorMessage={error.get("manager")}
      apiUrl={`project-managers/unique/names/${id}`}
      mode="single"
      cacheData={false}
    />
  ) : (
    <>
      <BorderContainer
        title={t("pro_manager_name")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-3"
      >
        <MultiTabInput
          optionalKey={"optional_lang"}
          onTabChanged={(key: string, tabName: string) => {
            setProjectStruction((prev: any) => ({
              ...prev,
              [key]: tabName,
              optional_lang: tabName,
            }));
          }}
          onChanged={(value: string, name: string) => {
            setProjectStruction((prev: any) => ({
              ...prev,
              [name]: value,
            }));
          }}
          name="pro_manager_name"
          highlightColor="bg-tertiary"
          userData={projectStruction}
          errorData={error}
          placeholder={t("name")}
          className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
          tabsClassName="gap-x-5 px-3"
        >
          <SingleTab>english</SingleTab>
          <SingleTab>farsi</SingleTab>
          <SingleTab>pashto</SingleTab>
        </MultiTabInput>
      </BorderContainer>
      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("pro_manager_contact")}
        placeholder={t("contact")}
        defaultValue={projectStruction?.pro_manager_contact}
        type="text"
        name="pro_manager_contact"
        errorMessage={error.get("pro_manager_contact")}
        onChange={handleChange}
      />
      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("pro_manager_email")}
        placeholder={t("email")}
        defaultValue={projectStruction?.pro_manager_email}
        type="email"
        name="pro_manager_email"
        errorMessage={error.get("pro_manager_email")}
        onChange={handleChange}
      />
    </>
  );
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr text-start">
          {t("add")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col w-full lg:w-[80%] gap-y-6 pb-12">
        <CustomCheckbox
          parentClassName="space-x-0"
          className=""
          checked={projectStruction?.previous_manager}
          text={t("previous_manager")}
          description={t("already_manager")}
          onCheckedChange={function (value: boolean): void {
            setProjectStruction((prev: any) => ({
              ...prev,
              previous_manager: value,
            }));
          }}
        />
        {projectManager}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="rtl:text-xl-rtl ltr:text-lg-ltr"
          variant="outline"
          onClick={() => {
            modelOnRequestHide();
          }}
        >
          {t("cancel")}
        </Button>
        {hasEdit && (
          <PrimaryButton onClick={saveData} className={`shadow-lg`}>
            <ButtonSpinner loading={storing}>{t("save")}</ButtonSpinner>
          </PrimaryButton>
        )}
      </CardFooter>
    </Card>
  );
}
