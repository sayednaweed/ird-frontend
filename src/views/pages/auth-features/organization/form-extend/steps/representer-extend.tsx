import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";

export default function RepresenterExtendTab() {
  const { t } = useTranslation();
  const { userData, setUserData, error } = useContext(StepperContext);
  let { id } = useParams();

  return (
    <div className="flex flex-col mt-10 w-full md:w-[60%] lg:w-[400px] gap-y-6 pb-12">
      {userData.show_new_representer && (
        <CustomCheckbox
          checked={userData["new_represent"] || false}
          onCheckedChange={(value: boolean) =>
            setUserData({ ...userData, new_represent: value })
          }
          parentClassName="rounded-md w-fit py-[12px] gap-x-1 bg-card border px-[10px]"
          text={t("new_represent")}
          errorMessage={error.get("new_represent")}
        />
      )}
      {userData.new_represent ? (
        <>
          <BorderContainer
            title={t("representative")}
            required={true}
            parentClassName="p-t-4 pb-0 px-0"
            className="grid grid-cols-1 gap-y-3"
          >
            <MultiTabInput
              optionalKey={"optional_lang"}
              onTabChanged={(key: string, tabName: string) => {
                setUserData({
                  ...userData,
                  [key]: tabName,
                  optional_lang: tabName,
                });
              }}
              onChanged={(value: string, name: string) => {
                setUserData({
                  ...userData,
                  [name]: value,
                });
              }}
              name="repre_name"
              highlightColor="bg-tertiary"
              userData={userData}
              errorData={error}
              placeholder={t("enter_your_name")}
              className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
              tabsClassName="gap-x-5 px-3"
            >
              <SingleTab>english</SingleTab>
              <SingleTab>farsi</SingleTab>
              <SingleTab>pashto</SingleTab>
            </MultiTabInput>
          </BorderContainer>
        </>
      ) : (
        <APICombobox
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) =>
            setUserData({ ...userData, ["prev_rep"]: selection })
          }
          lable={t("prev_rep")}
          required={true}
          selectedItem={userData["prev_rep"]?.name}
          placeHolder={t("select")}
          errorMessage={error.get("prev_rep")}
          apiUrl={`organization/representors/name/${id}`}
          mode="single"
        />
      )}
    </div>
  );
}
