import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { CheckList } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import type { ProjectOrganizationStructureType } from "@/lib/types";
import { useOrganizationAuthState } from "@/stores/auth/use-auth-store";
import type { ValidateItem } from "@/validation/types";
import { setServerError, validate } from "@/validation/validation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { toast } from "sonner";

interface AddProjectManagerDailogProps {
  onComplete: (
    manager: Pick<
      ProjectOrganizationStructureType,
      | "pro_manager_name_english"
      | "pro_manager_name_farsi"
      | "pro_manager_name_pashto"
      | "pro_manager_contact"
      | "pro_manager_email"
    >
  ) => void;
}
export default function AddProjectManagerDailog(
  props: AddProjectManagerDailogProps
) {
  const { onComplete } = props;
  const { user } = useOrganizationAuthState();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<CheckList[] | undefined>(undefined);
  let { id } = useParams();

  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  const [error, setError] = useState(new Map<string, string>());
  const [userData, setUserData] = useState<ProjectOrganizationStructureType>({
    pro_manager_name_english: "",
    pro_manager_name_farsi: "",
    pro_manager_name_pashto: "",
    pro_manager_contact: "",
    pro_manager_email: "",
    previous_manager: false,
    manager: undefined,
  });

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(
        "projects/register/signed/form/checklist"
      );
      if (response.status == 200) {
        setList(response.data.checklist);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);
  const store = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const validationItems: ValidateItem[] = [];
      if (userData?.previous_manager) {
        validationItems.push({
          name: "manager",
          rules: ["required"],
        });
      } else {
        validationItems.push({
          name: "pro_manager_name_english",
          rules: ["required"],
        });
        validationItems.push({
          name: "pro_manager_name_farsi",
          rules: ["required"],
        });
        validationItems.push({
          name: "pro_manager_name_pashto",
          rules: ["required"],
        });
        validationItems.push({
          name: "pro_manager_contact",
          rules: ["required"],
        });
        validationItems.push({
          name: "pro_manager_email",
          rules: ["required"],
        });
      }
      const passed = await validate(validationItems, userData, setError);
      if (!passed) return;
      // 2. Store
      const response = await axiosClient.post(
        `projects/organization/structure/${id}`,
        {
          organization_id: user.id,
          manager: userData?.manager,
          pro_manager_name_english: userData?.manager,
          pro_manager_name_farsi: userData?.pro_manager_name_farsi,
          pro_manager_name_pashto: userData?.pro_manager_name_pashto,
          pro_manager_contact: userData?.pro_manager_contact,
          pro_manager_email: userData?.pro_manager_email,
        }
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        onComplete(response.data?.manager);
        modelOnRequestHide();
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
    setUserData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };
  const projectManager = userData?.previous_manager ? (
    <APICombobox
      placeholderText={t("search_item")}
      errorText={t("no_item")}
      onSelect={(selection: any) =>
        setUserData((prev: any) => ({
          ...prev,
          ["manager"]: selection,
        }))
      }
      lable={t("manager")}
      required={true}
      requiredHint={`* ${t("required")}`}
      selectedItem={userData["manager"]?.name}
      placeHolder={t("select_a")}
      errorMessage={error.get("manager")}
      apiUrl={"project-managers/names/" + user?.id}
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
          name="pro_manager_name"
          highlightColor="bg-tertiary"
          userData={userData}
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
        defaultValue={userData["pro_manager_contact"]}
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
        defaultValue={userData?.pro_manager_email}
        type="email"
        name="pro_manager_email"
        errorMessage={error.get("pro_manager_email")}
        onChange={handleChange}
      />
    </>
  );
  return (
    <Card className="w-full my-8 self-center [backdrop-filter:blur(20px)] bg-card">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {t("up_register_fo")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        {list ? (
          <NastranSpinner />
        ) : (
          <>
            <CustomCheckbox
              parentClassName="space-x-0"
              className=""
              checked={userData?.previous_manager}
              text={t("previous_manager")}
              description={t("already_manager")}
              onCheckedChange={function (value: boolean): void {
                setUserData((prev: any) => ({
                  ...prev,
                  previous_manager: value,
                }));
              }}
            />
            {projectManager}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="rtl:text-xl-rtl ltr:text-lg-ltr"
          variant="outline"
          onClick={modelOnRequestHide}
        >
          {t("cancel")}
        </Button>
        <PrimaryButton
          disabled={loading}
          onClick={store}
          className={`${loading && "opacity-90"}`}
          type="submit"
        >
          <ButtonSpinner loading={loading}>{t("store")}</ButtonSpinner>
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
