import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { validate } from "@/validation/validation";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { FAQ } from "@/database/models";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import ServerError from "@/components/custom-ui/resuseable/server-error";
import { useScrollToElement } from "@/hook/use-scroll-to-element";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
export interface FaqsDialogProps {
  onComplete: (faq: FAQ, isEdited: boolean) => void;
  onCancel?: () => void;
  faq?: FAQ;
}
export default function FaqsDialog(props: FaqsDialogProps) {
  const { onComplete, faq, onCancel } = props;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(new Map<string, string>());
  useScrollToElement(error);
  const [userData, setUserData] = useState<any>({
    question_english: "",
    question_farsi: "",
    question_pashto: "",
    answer_english: "",
    answer_farsi: "",
    answer_pashto: "",
    show: true,
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  const fetch = async () => {
    try {
      const response = await axiosClient.get(`faqs/${faq?.id}`);
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error: any) {
      console.log(error);
    } finally {
      setFetching(false);
    }
  };
  useEffect(() => {
    if (faq) fetch();
  }, []);

  const action = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "question_english",
            rules: ["required", "max:120", "min:3"],
          },
          {
            name: "question_farsi",
            rules: ["required", "max:120", "min:3"],
          },
          {
            name: "question_pashto",
            rules: ["required", "max:120", "min:3"],
          },
          {
            name: "answer_english",
            rules: ["required", "max:255", "min:3"],
          },
          {
            name: "answer_farsi",
            rules: ["required", "max:255", "min:3"],
          },
          {
            name: "answer_pashto",
            rules: ["required", "max:255", "min:3"],
          },
          {
            name: "type",
            rules: ["required"],
          },
          {
            name: "show",
            rules: ["required"],
          },
        ],

        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const data = {
        id: faq?.id,
        question_english: userData.question_english,
        question_farsi: userData.question_farsi,
        question_pashto: userData.question_pashto,
        answer_english: userData.answer_english,
        answer_farsi: userData.answer_farsi,
        answer_pashto: userData.answer_pashto,
        type_id: userData.type?.id,
        type: userData.type?.name,
        show: userData.show,
      };
      const response = faq
        ? await axiosClient.put("faqs", data)
        : await axiosClient.post("faqs", data);
      if (response.status === 200) {
        toast.success(response.data.message);
        if (faq) onComplete(response.data.faq, true);
        else onComplete(response.data.faq, false);
        modelOnRequestHide();
      }
    } catch (error: any) {
      toast.error(<ServerError errors={error.response.data.errors} />);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loader = (
    <CardContent className="space-y-5">
      <Shimmer className="h-12" />
      <Shimmer className="h-36" />
    </CardContent>
  );

  return (
    <Card className="w-full px-2 md:w-fit md:min-w-[700px] self-center bg-card my-12">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {faq ? t("edit") : t("add")}
        </CardTitle>
      </CardHeader>
      {/* {slideshow && fetching ? ( */}
      {faq && fetching ? (
        loader
      ) : (
        <>
          <CardContent className=" space-y-4">
            <BorderContainer
              title={t("question")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0 mb-8"
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
                name="question"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("detail")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabInput>
            </BorderContainer>
            <BorderContainer
              title={t("answer")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0 mb-8"
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
                name="answer"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("detail")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabInput>
            </BorderContainer>
            <APICombobox
              parentClassName=" md:w-1/2"
              placeholderText={t("search_item")}
              errorText={t("no_item")}
              required={true}
              requiredHint={`* ${t("required")}`}
              onSelect={(selection: any) =>
                setUserData({ ...userData, ["type"]: selection })
              }
              lable={t("type")}
              selectedItem={userData["type"]?.name}
              placeHolder={t("select")}
              errorMessage={error.get("type")}
              apiUrl={"faqs-types"}
              mode="single"
              cacheData={false}
            />
            <CustomCheckbox
              checked={userData.show}
              onCheckedChange={(value: boolean) =>
                setUserData({ ...userData, show: value })
              }
              description={t("show_des")}
              parentClassName="rounded-md py-[12px] gap-x-1 bg-card border px-[10px]"
              text={t("show")}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-4 justify-center xxl:justify-between">
            <Button
              className="rtl:text-xl-rtl ltr:text-lg-ltr"
              variant="outline"
              onClick={() => {
                modelOnRequestHide();
                if (onCancel) onCancel();
              }}
            >
              {t("cancel")}
            </Button>
            <PrimaryButton
              disabled={loading}
              color={error.size > 0 ? "error" : "normal"}
              onClick={action}
              className={`${loading && "opacity-90"}`}
              type="submit"
            >
              <ButtonSpinner loading={loading}>
                {t(faq ? "update" : "save")}
              </ButtonSpinner>
            </PrimaryButton>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
