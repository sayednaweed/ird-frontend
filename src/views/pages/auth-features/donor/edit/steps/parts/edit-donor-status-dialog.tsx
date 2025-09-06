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
import { useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { useParams } from "react-router";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import type { DonorStatus } from "@/database/models";
import { toast } from "sonner";
import CustomTextarea from "@/components/custom-ui/textarea/CustomTextarea";

export interface EditNgoStatusDialogProps {
  onComplete: (donorStatus: DonorStatus) => void;
}
export default function EditDonorStatusDialog(props: EditNgoStatusDialogProps) {
  const { onComplete } = props;
  const [storing, setStoring] = useState(false);
  const [error, setError] = useState(new Map<string, string>());
  const { id } = useParams();

  const [userData, setUserData] = useState<{
    status: { id: number; name: string } | undefined;
    comment: "";
  }>({
    status: undefined,
    comment: "",
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const add = async () => {
    try {
      if (storing) return;
      setStoring(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "status",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "comment",
            rules: ["required", "max:128", "min:15"],
          },
        ],
        userData,
        setError
      );
      if (!passed) {
        setStoring(false);
        return;
      }
      // 2. Store
      const response = await axiosClient.put("statuses/modify/donor", {
        status_id: userData?.status?.id,
        comment: userData.comment,
        donor_id: id,
      });
      if (response.status === 200) {
        toast.success(response.data.message);
        const status = response.data.status;
        const donorStatus: DonorStatus = {
          id: status.donor_status_id as string,
          is_active: status.is_active,
          created_at: status.created_at as string,
          donor_id: id as string,
          comment: userData.comment as string,
          status_id: userData.status!.id,
          name: userData.status?.name,
          username: status.username,
        };
        onComplete(donorStatus);
        modelOnRequestHide();
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (userData) setUserData({ ...userData, [name]: value });
  };
  return (
    <Card className="w-full self-center [backdrop-filter:blur(20px)] bg-card dark:bg-card-secondary">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {t("edit")}
        </CardTitle>
      </CardHeader>
      {storing ? (
        <NastranSpinner className=" mx-auto" />
      ) : (
        <CardContent className="flex flex-col mt-10 w-full md:w-[60%] gap-y-6 pb-12">
          <APICombobox
            requiredHint={`* ${t("required")}`}
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) => {
              setUserData({
                ...userData,
                status: selection,
              });
            }}
            lable={t("status")}
            required={true}
            selectedItem={userData?.status?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("status")}
            apiUrl={"statuses/modify/donor/" + id}
            mode="single"
            cacheData={false}
          />

          <CustomTextarea
            required={true}
            requiredHint={`* ${t("required")}`}
            label={t("comment")}
            name="comment"
            defaultValue={userData["comment"]}
            placeholder={t("detail")}
            errorMessage={error.get("comment")}
            onBlur={handleChange}
            rows={5}
          />
        </CardContent>
      )}
      <CardFooter className="flex justify-between">
        <Button
          className="rtl:text-xl-rtl ltr:text-lg-ltr"
          variant="outline"
          onClick={modelOnRequestHide}
        >
          {t("cancel")}
        </Button>
        <PrimaryButton
          disabled={storing}
          onClick={add}
          className={`${storing && "opacity-90"}`}
          type="submit"
        >
          <ButtonSpinner loading={storing}>{t("save")}</ButtonSpinner>
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
