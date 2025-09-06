import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import FileChooser from "@/components/custom-ui/chooser/FileChooser";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";

export default function AddNewsInformation() {
  const { t } = useTranslation();
  const { userData, setUserData, error } = useContext(StepperContext);

  return (
    <>
      <div className="flex flex-col mt-10 w-full md:w-[60%] lg:w-[400px] gap-y-6 pb-12">
        <BorderContainer
          title={t("title")}
          required={true}
          parentClassName="p-t-4 pb-0 px-0"
          className="grid grid-cols-1 gap-y-3"
        >
          <MultiTabTextarea
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
            name="title"
            highlightColor="bg-tertiary"
            userData={userData}
            errorData={error}
            placeholder={t("detail")}
            rows={1}
            className="rtl:text-xl-rtl rounded-none border-t border-x-0"
            tabsClassName="gap-x-5 px-3"
          >
            <SingleTab>english</SingleTab>
            <SingleTab>farsi</SingleTab>
            <SingleTab>pashto</SingleTab>
          </MultiTabTextarea>
        </BorderContainer>
        <APICombobox
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) =>
            setUserData({ ...userData, ["type"]: selection })
          }
          lable={t("type")}
          required={true}
          selectedItem={userData["type"]?.name}
          placeHolder={t("select_a")}
          errorMessage={error.get("type")}
          apiUrl={"news-types"}
          mode="single"
        />
        <APICombobox
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) =>
            setUserData({ ...userData, ["priority"]: selection })
          }
          lable={t("priority")}
          required={true}
          selectedItem={userData["priority"]?.name}
          placeHolder={t("select_a")}
          errorMessage={error.get("priority")}
          apiUrl={"priorities"}
          mode="single"
        />
        <CustomDatePicker
          placeholder={t("select_a_date")}
          lable={t("date")}
          requiredHint={`* ${t("required")}`}
          required={true}
          value={userData.date}
          dateOnComplete={(date: DateObject) => {
            setUserData({ ...userData, date: date });
          }}
          className="py-3"
          errorMessage={error.get("date")}
        />

        <BorderContainer
          title={t("visibility")}
          required={false}
          parentClassName="mt-3"
          className="flex flex-col items-start gap-y-3"
        >
          <CustomCheckbox
            checked={userData["visibility_duration"]}
            onCheckedChange={(value: boolean) =>
              setUserData({ ...userData, visibility_duration: value })
            }
            parentClassName="rounded-md py-[12px] gap-x-1 bg-card border px-[10px]"
            text={t("visibility_duration")}
            description={t("visibility_duration_des")}
            errorMessage={error.get("visibility_duration")}
          />
          {userData.visibility_duration && (
            <CustomDatePicker
              placeholder={t("select_a_date")}
              lable={t("visibility_date")}
              requiredHint={`* ${t("required")}`}
              required={true}
              value={userData.visibility_date}
              dateOnComplete={(date: DateObject) => {
                setUserData({ ...userData, visibility_date: date });
              }}
              className="py-3 w-full"
              parentClassName="w-full"
              errorMessage={error.get("visibility_date")}
            />
          )}
        </BorderContainer>
      </div>
      <BorderContainer
        title={t("content")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-y-3"
      >
        <MultiTabTextarea
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
          name="content"
          highlightColor="bg-tertiary"
          userData={userData}
          errorData={error}
          placeholder={t("detail")}
          rows={10}
          className="rtl:text-xl-rtl rounded-none border-t border-x-0"
          tabsClassName="gap-x-5 px-3"
        >
          <SingleTab>english</SingleTab>
          <SingleTab>farsi</SingleTab>
          <SingleTab>pashto</SingleTab>
        </MultiTabTextarea>
      </BorderContainer>

      <FileChooser
        parentClassName="mt-6 w-full md:w-[60%] lg:w-[400px]"
        lable={t("cover_pic")}
        required={true}
        requiredHint={`* ${t("required")}`}
        defaultFile={userData.cover_pic}
        errorMessage={error.get("cover_pic")}
        onchange={(file: File | undefined) =>
          setUserData({ ...userData, cover_pic: file })
        }
        validTypes={["image/png", "image/jpeg", "image/gif"]}
        maxSize={2}
        accept="image/png, image/jpeg, image/gif"
      />
    </>
  );
}
