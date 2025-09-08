import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomPhoneInput from "@/components/custom-ui/input/custom-phone-input";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { useOrganizationAuthState } from "@/stores/auth/use-auth-store";
import { useContext } from "react";
import { useTranslation } from "react-i18next";

export default function AdOrganizationStructure() {
  const { t } = useTranslation();
  const { user } = useOrganizationAuthState();
  const { userData, setUserData, error } = useContext(StepperContext);
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

      <CustomPhoneInput
        label={t("pro_manager_contact")}
        required={true}
        requiredHint={`* ${t("required")}`}
        onChange={handleChange}
        value={userData["pro_manager_contact"]}
        name="pro_manager_contact"
        errorMessage={error.get("pro_manager_contact")}
      />
      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("pro_manager_email")}
        placeholder={t("email")}
        defaultValue={userData["pro_manager_email"]}
        type="email"
        name="pro_manager_email"
        errorMessage={error.get("pro_manager_email")}
        onChange={handleChange}
      />
    </>
  );
  return (
    <div className="flex flex-col mt-10 w-full lg:w-1/2 2xl:w-1/3 gap-y-6 pb-12">
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
    </div>
  );
}
