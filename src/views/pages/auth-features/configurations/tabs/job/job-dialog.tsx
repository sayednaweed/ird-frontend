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
import { setServerError, validate } from "@/validation/validation";
import type { BasicModel } from "@/database/models";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";

export interface JobDialogProps {
  onComplete: (job: BasicModel) => void;
  job?: BasicModel;
}
export default function JobDialog(props: JobDialogProps) {
  const { onComplete, job } = props;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(new Map<string, string>());
  const [userData, setUserData] = useState({
    name_farsi: "",
    name_english: "",
    name_pashto: "",
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const fetch = async () => {
    try {
      const response = await axiosClient.get(`jobs/${job?.id}`);
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error: any) {
      console.log(error);
    }
    setFetching(false);
  };
  useEffect(() => {
    if (job) fetch();
  }, []);

  const store = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "name_english",
            rules: ["required"],
          },
          {
            name: "name_farsi",
            rules: ["required"],
          },
          {
            name: "name_pashto",
            rules: ["required"],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const response = await axiosClient.post("jobs", {
        english: userData.name_english,
        farsi: userData.name_farsi,
        pashto: userData.name_pashto,
      });
      if (response.status === 200) {
        toast.success(response.data.message);
        onComplete(response.data.job);
        modelOnRequestHide();
      }
    } catch (error: any) {
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const update = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "name_english",
            rules: ["required"],
          },
          {
            name: "name_farsi",
            rules: ["required"],
          },
          {
            name: "name_pashto",
            rules: ["required"],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. update
      const response = await axiosClient.put(`jobs`, {
        id: job?.id,
        english: userData.name_english,
        farsi: userData.name_farsi,
        pashto: userData.name_pashto,
      });
      if (response.status === 200) {
        toast.success(response.data.message);

        onComplete(response.data.job);
        modelOnRequestHide();
      }
    } catch (error: any) {
      toast.error(error.response.data.message);

      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const loader = (
    <CardContent className="space-y-5">
      <Shimmer className="h-12" />
      <Shimmer className="h-12" />
      <Shimmer className="h-12" />
    </CardContent>
  );
  return (
    <Card className="w-full px-2 md:w-fit md:min-w-[700px] self-center bg-card my-12">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {job ? t("edit") : t("add")}
        </CardTitle>
      </CardHeader>
      {job && fetching ? (
        loader
      ) : (
        <>
          <CardContent>
            <BorderContainer
              title={t("name")}
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
                name="name"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("name")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabInput>
            </BorderContainer>
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
              onClick={job ? update : store}
              className={`${loading && "opacity-90"}`}
              type="submit"
            >
              <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
            </PrimaryButton>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
