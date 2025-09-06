import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomPhoneInput from "@/components/custom-ui/input/custom-phone-input";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface StaffInputsProps {
  setUserData: any;
  userData: any;
  error: Map<string, string>;
  manipulating: boolean;
  saveData: () => Promise<void>;
  inputName: string;
  hasEdit?: boolean;
  hasAdd?: boolean;
  multiTabPlaceholder: string;
}

export default function StaffInputs(props: StaffInputsProps) {
  const {
    setUserData,
    userData,
    manipulating,
    error,
    saveData,
    inputName,
    hasEdit,
    hasAdd,
    multiTabPlaceholder,
  } = props;
  const { t } = useTranslation();
  const handleChange = (e: any) => {
    if (userData) {
      const { name, value } = e.target;
      setUserData({ ...userData, [name]: value });
    }
  };
  return (
    <section className="flex flex-col gap-y-4">
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
        name={inputName}
        highlightColor="bg-tertiary"
        userData={userData}
        errorData={error}
        placeholder={t(multiTabPlaceholder)}
        rows={1}
        className="rtl:text-xl-rtl rounded-md"
        tabsClassName="gap-x-5"
      >
        <SingleTab>english</SingleTab>
        <SingleTab>farsi</SingleTab>
        <SingleTab>pashto</SingleTab>
      </MultiTabTextarea>
      <CustomInput
        size_="sm"
        name="email"
        className="xl:w-[70%]"
        value={userData?.email}
        placeholder={t("enter_your_email")}
        label={t("email")}
        type="email"
        errorMessage={error.get("email")}
        onChange={handleChange}
        startContent={
          <Mail className="text-secondary-foreground size-[18px] pointer-events-none" />
        }
      />
      <CustomPhoneInput
        label={t("contact")}
        parentClassName="xl:w-[70%]"
        onChange={handleChange}
        value={userData?.contact}
        name="contact"
        errorMessage={error.get("contact")}
      />
      {(hasAdd || hasEdit) && (
        <PrimaryButton
          disabled={manipulating}
          onClick={async () => await saveData()}
          className={`shadow-lg mt-4`}
        >
          <ButtonSpinner loading={manipulating}>
            {userData.editable ? t("update") : t("save")}
          </ButtonSpinner>
        </PrimaryButton>
      )}
    </section>
  );
}
