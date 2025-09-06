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
import { useEffect, useState, type ChangeEvent } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { Slideshow } from "@/database/models";
import { isFile, validateFile } from "@/lib/utils";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";

export interface SlideshowDialogProps {
  onComplete: (slideshow: Slideshow, isEdited: boolean) => void;
  onCancel?: () => void;
  slideshow?: Slideshow;
}
export default function SlideshowDialog(props: SlideshowDialogProps) {
  const { onComplete, slideshow, onCancel } = props;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(new Map<string, string>());
  const [userData, setUserData] = useState<any>({
    id: "",
    title: "",
    description: "",
    image: "",
    visible: 1,
    saved_by: "",
    imageUrl: "",
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const fetch = async () => {
    try {
      const response = await axiosClient.get(`slideshows/${slideshow?.id}`);
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error: any) {
      console.log(error);
    }
    setFetching(false);
  };
  useEffect(() => {
    if (slideshow) fetch();
  }, []);

  const action = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "title_english",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "title_farsi",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "title_pashto",
            rules: ["required", "max:100", "min:3"],
          },
          {
            name: "description_english",
            rules: ["required", "max:400", "min:3"],
          },
          {
            name: "description_farsi",
            rules: ["required", "max:400", "min:3"],
          },
          {
            name: "description_pashto",
            rules: ["required", "max:400", "min:3"],
          },
          {
            name: "image",
            rules: ["required"],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const formData = new FormData();
      if (slideshow?.id) formData.append("id", slideshow?.id);
      formData.append("title_english", userData.title_english);
      formData.append("title_farsi", userData.title_farsi);
      formData.append("title_pashto", userData.title_pashto);
      formData.append("description_english", userData.description_english);
      formData.append("description_farsi", userData.description_farsi);
      formData.append("description_pashto", userData.description_pashto);
      formData.append("visible", userData.visible);
      formData.append("image", userData.image);
      const response = slideshow
        ? await axiosClient.post("slideshows", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              _method: "PUT", // Laravel treats this POST as a PUT
            },
          })
        : await axiosClient.post("slideshows", formData);
      if (response.status === 200) {
        toast.success(response.data.message);
        if (slideshow) onComplete(response.data.slideshow, true);
        else onComplete(response.data.slideshow, false);
        modelOnRequestHide();
      }
    } catch (error: any) {
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const onFileUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const maxFileSize = 2 * 1024 * 1024; // 2MB

    const validTypes: string[] = ["image/jpeg", "image/png", "image/jpg"];
    const fileInput = e.target;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const checkFile = fileInput.files[0] as File;
    const file = validateFile(
      checkFile,
      Math.round(maxFileSize),
      validTypes,
      t
    );

    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a temporary URL for the image
      setUserData({
        ...userData,
        image: file,
        imageUrl: imageUrl,
      });

      /** Reset file input */
      if (e.currentTarget) {
        e.currentTarget.type = "text";
        e.currentTarget.type = "file"; // Reset to file type
      }
    }
  };
  const loader = (
    <CardContent className="space-y-4 flex flex-col">
      <Shimmer className="h-44 xxl:h-92 w-96 border-2 border-tertiary mx-auto p-2 rounded-lg border-dashed transition-opacity cursor-pointer hover:opacity-80" />
      <Shimmer className="h-12" />
      <Shimmer className="h-20" />
      <Shimmer className="h-10" />
    </CardContent>
  );
  return (
    <Card className="w-full px-2 md:w-fit md:min-w-[700px] self-center bg-card my-12">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {slideshow ? t("edit") : t("add")}
        </CardTitle>
      </CardHeader>
      {/* {slideshow && fetching ? ( */}
      {slideshow && fetching ? (
        loader
      ) : (
        <>
          <CardContent className="space-y-4 flex flex-col">
            <label htmlFor="image_imput" className="w-fit mx-auto">
              {isFile(userData.image) ? (
                <img
                  src={userData.imageUrl}
                  className="h-44 xxl:h-92 w-96 border-2 border-tertiary mx-auto p-2 rounded-lg border-dashed transition-opacity cursor-pointer hover:opacity-80"
                />
              ) : (
                <CachedImage
                  src={userData.image}
                  alt="Avatar"
                  shimmerClassName="h-44 xxl:h-92 w-96 border-2 border-tertiary mx-auto p-2 rounded-lg border-dashed transition-opacity cursor-pointer hover:opacity-80"
                  className="h-44 xxl:h-92 w-96 border-2 border-tertiary mx-auto p-2 rounded-lg border-dashed transition-opacity cursor-pointer hover:opacity-80"
                  routeIdentifier={"public"}
                />
              )}
              <input
                id="image_imput"
                type="file"
                className={`hidden w-0 h-0`}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  onFileUploadChange(e);
                }}
              />
              {error.get("image") && (
                <h1 className="rtl:text-md-rtl ltr:text-sm-ltr text-center pt-2 capitalize text-red-400">
                  {error.get("image")}
                </h1>
              )}
            </label>

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
              name="title"
              highlightColor="bg-tertiary"
              userData={userData}
              errorData={error}
              placeholder={t("title")}
              className="rtl:text-xl-rtl"
              parentClassName="mt-12"
              tabsClassName="gap-x-5 px-3"
            >
              <SingleTab>english</SingleTab>
              <SingleTab>farsi</SingleTab>
              <SingleTab>pashto</SingleTab>
            </MultiTabInput>
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
              name="description"
              highlightColor="bg-tertiary"
              userData={userData}
              errorData={error}
              placeholder={t("description")}
              rows={4}
              className="rtl:text-xl-rtl"
              tabsClassName="gap-x-5 px-3"
            >
              <SingleTab>english</SingleTab>
              <SingleTab>farsi</SingleTab>
              <SingleTab>pashto</SingleTab>
            </MultiTabTextarea>

            <CustomCheckbox
              checked={userData["visible"] == true}
              onCheckedChange={(value: boolean) =>
                setUserData({ ...userData, visible: value })
              }
              parentClassName="rounded-md py-[12px] gap-x-1 bg-card border px-[10px]"
              text={t("visible")}
              description={t("set_acco_act_or_dec")}
              errorMessage={error.get("visible")}
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
              onClick={action}
              className={`${loading && "opacity-90"}`}
              type="submit"
            >
              <ButtonSpinner loading={loading}>
                {t(slideshow ? "update" : "save")}
              </ButtonSpinner>
            </PrimaryButton>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
