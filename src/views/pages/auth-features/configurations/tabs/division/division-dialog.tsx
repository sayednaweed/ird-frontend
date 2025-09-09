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
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { BasicModel } from "@/database/models";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";

export interface RolesDialogProps {
  onComplete: (division: BasicModel, isEdited: boolean) => void;
  onCancel?: () => void;
  division?: BasicModel;
}
export default function RolesDialog(props: RolesDialogProps) {
  const { onComplete, division, onCancel } = props;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(new Map<string, string>());
  const [userData, setUserData] = useState({
    name_english: "",
    name_farsi: "",
    name_pashto: "",
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const fetch = async () => {
    try {
      const response = await axiosClient.get(`divisions/${division?.id}`);
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error: any) {
      console.log(error);
    }
    setFetching(false);
  };
  useEffect(() => {
    if (division) fetch();
  }, []);

  const action = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "name_english",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "name_farsi",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "name_pashto",
            rules: ["required", "max:100", "min:3"],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const formData = new FormData();
      if (division?.id) formData.append("id", division?.id.toString());
      formData.append("english", userData.name_english);
      formData.append("farsi", userData.name_farsi);
      formData.append("pashto", userData.name_pashto);
      const response = division
        ? await axiosClient.post("divisions", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              _method: "PUT", // Laravel treats this POST as a PUT
            },
          })
        : await axiosClient.post("divisions", formData);
      if (response.status === 200) {
        toast.success(response.data.message);
        if (division) onComplete(response.data.division, true);
        else onComplete(response.data.division, false);
        modelOnRequestHide();
      }
    } catch (error: any) {
      setServerError(error.response.data.errors, setError);
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
          {division ? t("edit") : t("add")}
        </CardTitle>
      </CardHeader>
      {/* {slideshow && fetching ? ( */}
      {division && fetching ? (
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
              onClick={action}
              className={`${loading && "opacity-90"}`}
              type="submit"
            >
              <ButtonSpinner loading={loading}>
                {t(division ? "update" : "save")}
              </ButtonSpinner>
            </PrimaryButton>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
