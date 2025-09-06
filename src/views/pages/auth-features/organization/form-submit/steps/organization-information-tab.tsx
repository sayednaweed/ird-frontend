import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
import ConfirmationDialog from "@/components/custom-ui/dialog/confirmation-dialog";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { CountryEnum, TaskTypeEnum } from "@/database/model-enums";
import axiosClient from "@/lib/axois-client";
import { useContext, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

interface OrganizationInformationTabProps {
  fetchUrl: string;
  type: "extend" | "register";
}
export default function OrganizationInformationTab(
  props: OrganizationInformationTabProps
) {
  const { fetchUrl, type } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const navigate = useNavigate();
  const { userData, setUserData, error } = useContext(StepperContext);

  const fetchData = async () => {
    try {
      const response = await axiosClient.get(`${fetchUrl}${id}`);
      if (response.status == 200) {
        const organization = response.data.organization;
        let content = response.data.content;
        // Ask if user wants to resume prevoius operation
        if (content) {
          content = JSON.parse(content);
          if (!content?.new_director) {
            if (type == "extend") {
              content.new_director = false;
              content.show_new_director = true;
            } else {
              content.new_director = true;
              content.show_new_director = false;
            }
          }
          if (!content?.new_represent) {
            if (type == "extend") {
              content.new_represent = false;
              content.show_new_representer = true;
            } else {
              content.new_represent = true;
              content.show_new_representer = false;
            }
          }
          setUserData({
            ...content,
            allowed: true,
            shouldContinue: false,
            establishment_date:
              content.establishment_date &&
              new DateObject(new Date(content.establishment_date)),
            // If checklistMap exist means it is array
            checklistMap: content.checklistMap
              ? new Map(content.checklistMap)
              : new Map<string, any>(),
          });
        } else {
          // no data is stored
          organization.new_director = false;
          organization.show_new_director = true;
          organization.new_represent = false;
          organization.show_new_representer = true;
          setUserData((prev: any) => ({
            ...prev,
            allowed: true,
            shouldContinue: true,
            checklistMap: new Map<string, any>(),
            ...organization,
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
  // The passed state
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };
  return userData?.shouldContinue == false ? (
    <ConfirmationDialog
      onComplete={async (clearState: boolean, response: any) => {
        if (clearState) {
          const organization = response.data.organization;
          setUserData({
            allowed: true,
            shouldContinue: true,
            ...organization,
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
        task_type: TaskTypeEnum.organization_registeration,
      }}
      url={"organizations/task/content/" + id}
    />
  ) : userData?.allowed ? (
    <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-x-4 xl:gap-x-12 lg:items-start mt-4 gap-y-3 w-full lg:w-full">
      <BorderContainer
        title={t("organization_name")}
        required={true}
        parentClassName="pb-0 px-0"
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
          name="name"
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
        required={true}
        requiredHint={`* ${t("required")}`}
        size_="sm"
        label={t("abbr")}
        name="abbr"
        defaultValue={userData["abbr"]}
        placeholder={t("abbr_english")}
        type="text"
        className="uppercase"
        errorMessage={error.get("abbr")}
        onBlur={handleChange}
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData((prev: any) => ({
            ...prev,
            ["type"]: selection,
          }))
        }
        lable={t("type")}
        required={true}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["type"]?.name}
        placeHolder={t("select_a")}
        errorMessage={error.get("type")}
        apiUrl={"organization-types"}
        mode="single"
        readonly={true}
      />
      <CustomInput
        size_="sm"
        dir="ltr"
        required={true}
        requiredHint={`* ${t("required")}`}
        className="rtl:text-end"
        label={t("contact")}
        placeholder={t("enter_ur_pho_num")}
        defaultValue={userData["contact"]}
        type="text"
        name="contact"
        errorMessage={error.get("contact")}
        onChange={handleChange}
      />
      <CustomInput
        size_="sm"
        name="email"
        required={true}
        requiredHint={`* ${t("required")}`}
        label={t("email")}
        defaultValue={userData["email"]}
        placeholder={t("enter_your_email")}
        type="email"
        errorMessage={error.get("email")}
        onChange={handleChange}
        dir="ltr"
        className="rtl:text-right"
      />

      <CustomInput
        size_="sm"
        name="moe_registration_no"
        label={t("moe_registration_no")}
        defaultValue={userData["moe_registration_no"]}
        placeholder={t("enter_your_email")}
        type="moe_registration_no"
        errorMessage={error.get("moe_registration_no")}
        onChange={handleChange}
        dir="ltr"
        className="rtl:text-right"
      />

      <BorderContainer
        title={t("place_of_establishment")}
        required={true}
        parentClassName="mt-3"
        className="flex flex-col items-stretch gap-y-3"
      >
        <APICombobox
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) =>
            setUserData((prev: any) => ({
              ...prev,
              ["country"]: selection,
            }))
          }
          lable={t("country")}
          required={true}
          selectedItem={userData["country"]?.name}
          placeHolder={t("select_a")}
          errorMessage={error.get("country")}
          apiUrl={"countries"}
          mode="single"
          readonly={type == "extend"}
        />
        <CustomDatePicker
          placeholder={t("select_a_date")}
          lable={t("establishment_date")}
          requiredHint={`* ${t("required")}`}
          required={true}
          value={userData.establishment_date}
          dateOnComplete={(date: DateObject) => {
            setUserData((prev: any) => ({
              ...prev,
              establishment_date: date,
            }));
          }}
          className="py-3 w-full"
          errorMessage={error.get("establishment_date")}
          readonly={type == "extend"}
        />
      </BorderContainer>

      <BorderContainer
        title={t("head_office_add")}
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
              ["province"]: selection,
            }))
          }
          lable={t("province")}
          required={true}
          selectedItem={userData["province"]?.name}
          placeHolder={t("select_a")}
          errorMessage={error.get("province")}
          apiUrl={"provinces/" + CountryEnum.afghanistan}
          mode="single"
        />
        {userData.province && (
          <APICombobox
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) =>
              setUserData((prev: any) => ({
                ...prev,
                ["district"]: selection,
              }))
            }
            lable={t("district")}
            required={true}
            selectedItem={userData["district"]?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("district")}
            apiUrl={"districts/" + userData?.province?.id}
            mode="single"
            key={userData?.province?.id}
          />
        )}

        {userData.district && (
          <MultiTabInput
            title={t("area")}
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
            name="area"
            highlightColor="bg-tertiary"
            userData={userData}
            errorData={error}
            placeholder={t("content")}
            className="rtl:text-xl-rtl"
            tabsClassName="gap-x-5"
          >
            <SingleTab>english</SingleTab>
            <SingleTab>farsi</SingleTab>
            <SingleTab>pashto</SingleTab>
          </MultiTabInput>
        )}
      </BorderContainer>
    </div>
  ) : (
    <NastranSpinner />
  );
}
