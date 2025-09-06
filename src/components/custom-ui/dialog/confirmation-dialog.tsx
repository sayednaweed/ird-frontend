import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import NastranSpinner from "../spinner/NastranSpinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ConfirmationDialogProps {
  onComplete: (clearState: boolean, response: any) => void;
  url: string;
  params?: any;
}
export default function ConfirmationDialog(props: ConfirmationDialogProps) {
  const { onComplete, url, params } = props;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const clearTask = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const response = await axiosClient.delete(url, params);
      if (response.status === 200) {
        onComplete(true, response);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(t("error"));
    }
    setLoading(false);
  };
  const continueBtn = async () => {
    onComplete(false, undefined);
  };

  return (
    <div
      className={cn(
        "fixed z-40 grid grid-cols-1 justify-items-center items-center overflow-y-auto left-0 top-0 h-screen w-screen [backdrop-filter:blur(10px)]"
      )}
    >
      <Card className="w-fit min-w-[400px] self-center [backdrop-filter:blur(20px)] bg-card dark:bg-card-secondary">
        <CardHeader className="relative text-start">
          <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
            {t("confirmation")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <NastranSpinner label={t("loading")} />
          ) : (
            <h1 className=" rtl:text-xl-rtl">{t("continue_op_desc")}</h1>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            className="rtl:text-xl-rtl ltr:text-lg-ltr"
            variant="outline"
            onClick={clearTask}
          >
            {t("cancel")}
          </Button>
          <PrimaryButton
            disabled={loading}
            onClick={continueBtn}
            className={`${loading && "opacity-90"}`}
            type="submit"
          >
            <ButtonSpinner loading={loading}>{t("continue")}</ButtonSpinner>
          </PrimaryButton>
        </CardFooter>
      </Card>
    </div>
  );
}
