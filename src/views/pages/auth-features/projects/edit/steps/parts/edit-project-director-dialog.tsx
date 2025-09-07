import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { useParams } from "react-router";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import type { ValidateItem } from "@/validation/types";
import type { ProjectOrganizationStructureType } from "@/lib/types";
import type { ProjectStatus } from "@/database/models";

export interface EdirProjectDirectorDialogProps {
  onComplete: (projectStatus: ProjectStatus) => void;
  hasEdit?: boolean;
}
export default function EdirProjectDirectorDialog(
  props: EdirProjectDirectorDialogProps
) {
  const { hasEdit } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [projectStruction, setProjectStruction] = useState<
    ProjectOrganizationStructureType | any
  >(undefined);
  const [error, setError] = useState<Map<string, string>>(new Map());

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(
        `projects/organization/structure/${id}`
      );
      if (response.status == 200) {
        setProjectStruction(response.data);
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
      setLoading(false);
      return;
    }

    // 2. Store
    try {
      const response = await axiosClient.put("projects/budget", {
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
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
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
      apiUrl={"project-managers/names/" + id}
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
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("organ_structure")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_organ_structure_info")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : loading ? (
          <NastranSpinner />
        ) : (
          <div className="flex flex-col mt-10 w-full lg:w-1/2 2xl:w-1/3 gap-y-6 pb-12">
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
          </div>
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
          projectStruction &&
          hasEdit && (
            <PrimaryButton onClick={saveData} className={`shadow-lg`}>
              <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
            </PrimaryButton>
          )
        )}
      </CardFooter>
    </Card>
  );
}
