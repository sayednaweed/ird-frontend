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
import CustomInput from "@/components/custom-ui/input/CustomInput";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import type { BasicModel } from "@/database/models";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";

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
    farsi: "",
    english: "",
    pashto: "",
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
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const store = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "english",
            rules: ["required"],
          },
          {
            name: "farsi",
            rules: ["required"],
          },
          {
            name: "pashto",
            rules: ["required"],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const response = await axiosClient.post("jobs", {
        english: userData.english,
        farsi: userData.farsi,
        pashto: userData.pashto,
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
            name: "english",
            rules: ["required"],
          },
          {
            name: "farsi",
            rules: ["required"],
          },
          {
            name: "pashto",
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
        english: userData.english,
        farsi: userData.farsi,
        pashto: userData.pashto,
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
            <CustomInput
              size_="sm"
              dir="ltr"
              className="rtl:text-end"
              required={true}
              requiredHint={`* ${t("required")}`}
              placeholder={t("translate_en")}
              defaultValue={userData.english}
              type="text"
              name="english"
              errorMessage={error.get("english")}
              onChange={handleChange}
              startContentDark={true}
              startContent={
                <h1 className="font-bold text-primary-foreground text-[11px] mx-auto">
                  {t("en")}
                </h1>
              }
            />
            <CustomInput
              size_="sm"
              required={true}
              requiredHint={`* ${t("required")}`}
              placeholder={t("translate_fa")}
              defaultValue={userData.farsi}
              type="text"
              name="farsi"
              errorMessage={error.get("farsi")}
              onChange={handleChange}
              startContentDark={true}
              startContent={
                <h1 className="font-bold text-primary-foreground text-[11px] mx-auto">
                  {t("fa")}
                </h1>
              }
            />
            <CustomInput
              size_="sm"
              required={true}
              requiredHint={`* ${t("required")}`}
              placeholder={t("translate_ps")}
              defaultValue={userData.pashto}
              type="text"
              name="pashto"
              errorMessage={error.get("pashto")}
              onChange={handleChange}
              startContentDark={true}
              startContent={
                <h1 className="font-bold text-primary-foreground text-[11px] mx-auto">
                  {t("ps")}
                </h1>
              }
            />
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
