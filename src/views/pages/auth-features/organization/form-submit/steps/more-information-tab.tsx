import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import axiosClient from "@/lib/axois-client";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface MoreInformationTabProps {
  url?: string;
}
export default function MoreInformationTab(props: MoreInformationTabProps) {
  const { url } = props;
  const { t } = useTranslation();
  const { userData, setUserData, error } = useContext(StepperContext);
  const [loading, setLoading] = useState(false);
  const loadInformation = async () => {
    if (url) {
      try {
        setLoading(true);
        const response = await axiosClient.get(url);
        if (response.status == 200) {
          const organization = response.data.organization;
          if (organization)
            setUserData((prev: any) => ({
              ...prev,
              ...organization,
            }));
        }
      } catch (error: any) {
        toast.error(error.response.data.message);
        console.log(error);
      }
      setLoading(false);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);

  return loading ? (
    <NastranSpinner />
  ) : (
    <div className="flex flex-col lg:grid lg:grid-cols-1 gap-y-8 mt-4 w-full lg:w-full">
      <BorderContainer
        title={t("vision")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-y-3"
      >
        <MultiTabTextarea
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
          name="vision"
          rows={8}
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
        </MultiTabTextarea>
      </BorderContainer>

      <BorderContainer
        title={t("mission")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-y-3"
      >
        <MultiTabTextarea
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
          name="mission"
          highlightColor="bg-tertiary"
          userData={userData}
          errorData={error}
          placeholder={t("content")}
          rows={8}
          className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
          tabsClassName="gap-x-5 px-3"
        >
          <SingleTab>english</SingleTab>
          <SingleTab>farsi</SingleTab>
          <SingleTab>pashto</SingleTab>
        </MultiTabTextarea>
      </BorderContainer>

      <BorderContainer
        title={t("general_objes")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-y-3"
      >
        <MultiTabTextarea
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
          name="general_objes"
          highlightColor="bg-tertiary"
          userData={userData}
          errorData={error}
          placeholder={t("content")}
          rows={8}
          className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
          tabsClassName="gap-x-5 px-3"
        >
          <SingleTab>english</SingleTab>
          <SingleTab>farsi</SingleTab>
          <SingleTab>pashto</SingleTab>
        </MultiTabTextarea>
      </BorderContainer>

      <BorderContainer
        title={t("objes_in_afg")}
        required={true}
        parentClassName="p-t-4 pb-0 px-0"
        className="grid grid-cols-1 gap-y-3"
      >
        <MultiTabTextarea
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
          name="objes_in_afg"
          highlightColor="bg-tertiary"
          userData={userData}
          errorData={error}
          placeholder={t("content")}
          rows={8}
          className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
          tabsClassName="gap-x-5 px-3"
        >
          <SingleTab>english</SingleTab>
          <SingleTab>farsi</SingleTab>
          <SingleTab>pashto</SingleTab>
        </MultiTabTextarea>
      </BorderContainer>
    </div>
  );
}
