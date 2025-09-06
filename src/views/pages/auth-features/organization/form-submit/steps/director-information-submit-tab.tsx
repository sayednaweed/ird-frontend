import { useContext } from "react";
import { useTranslation } from "react-i18next";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { CountryEnum } from "@/database/model-enums";

export default function DirectorInformationSubmitTab() {
  const { userData, setUserData, error } = useContext(StepperContext);

  const { t } = useTranslation();
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-x-4 xl:gap-x-12 lg:items-stretch mt-4 gap-y-3 w-full lg:w-full">
      <BorderContainer
        title={t("director_name")}
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
          name="director_name"
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
        </MultiTabInput>
      </BorderContainer>

      <BorderContainer
        title={t("director_sur_en")}
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
          name="surname"
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

      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("director_contact")}
        placeholder={t("enter_ur_pho_num")}
        defaultValue={userData["director_contact"]}
        type="text"
        name="director_contact"
        errorMessage={error.get("director_contact")}
        onChange={handleChange}
      />
      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("director_email")}
        placeholder={t("enter_your_email")}
        defaultValue={userData["director_email"]}
        type="text"
        name="director_email"
        errorMessage={error.get("director_email")}
        onChange={handleChange}
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData((prev: any) => ({
            ...prev,
            ["gender"]: selection,
          }))
        }
        lable={t("gender")}
        required={true}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["gender"]?.name}
        placeHolder={t("select_a")}
        errorMessage={error.get("gender")}
        apiUrl={"genders"}
        mode="single"
      />

      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData((prev: any) => ({
            ...prev,
            ["nationality"]: selection,
          }))
        }
        required={true}
        requiredHint={`* ${t("required")}`}
        lable={t("nationality")}
        selectedItem={userData["nationality"]?.name}
        placeHolder={t("select_a")}
        errorMessage={error.get("nationality")}
        apiUrl={"nationalities"}
        mode="single"
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData((prev: any) => ({
            ...prev,
            ["identity_type"]: selection,
          }))
        }
        lable={t("identity_type")}
        required={true}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["identity_type"]?.name}
        placeHolder={t("select_a")}
        errorMessage={error.get("identity_type")}
        apiUrl={"nid/types"}
        mode="single"
      />

      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("nid")}
        placeholder={t("enter_ur_pho_num")}
        defaultValue={userData["nid"]}
        type="text"
        parentClassName="h-fit"
        name="nid"
        errorMessage={error.get("nid")}
        onChange={handleChange}
      />
      <BorderContainer
        title={t("address")}
        required={true}
        parentClassName="mt-3"
        className="flex flex-col items-start gap-y-3"
      >
        <APICombobox
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) =>
            setUserData((prev: any) => ({
              ...prev,
              ["director_province"]: selection,
            }))
          }
          lable={t("province")}
          required={true}
          selectedItem={userData["director_province"]?.name}
          placeHolder={t("select_a")}
          errorMessage={error.get("director_province")}
          apiUrl={"provinces/" + CountryEnum.afghanistan}
          mode="single"
        />
        {userData.director_province && (
          <APICombobox
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) =>
              setUserData((prev: any) => ({
                ...prev,
                ["director_dis"]: selection,
              }))
            }
            lable={t("director_dis")}
            required={true}
            selectedItem={userData["director_dis"]?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("director_dis")}
            apiUrl={"districts/" + userData?.director_province?.id}
            mode="single"
            key={userData?.director_province?.id}
          />
        )}

        {userData.director_dis && (
          <MultiTabTextarea
            title={t("director_area")}
            parentClassName="w-full"
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
            name="director_area"
            highlightColor="bg-tertiary"
            userData={userData}
            errorData={error}
            placeholder={t("content")}
            rows={5}
            className="rtl:text-xl-rtl"
            tabsClassName="gap-x-5"
          >
            <SingleTab>english</SingleTab>
            <SingleTab>farsi</SingleTab>
            <SingleTab>pashto</SingleTab>
          </MultiTabTextarea>
        )}
      </BorderContainer>
    </div>
  );
}
