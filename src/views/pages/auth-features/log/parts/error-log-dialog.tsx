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
import { useEffect, useState } from "react";
import axiosClient from "@/lib/axois-client";
import type { ErrorLog } from "@/database/models";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export interface ErrorLogDialogProps {
  onClose: () => void;
  errorLog?: ErrorLog;
}
export default function ErrorLogDialog(props: ErrorLogDialogProps) {
  const { onClose, errorLog } = props;
  const [fetching, setFetching] = useState(true);
  const [userData, setUserData] = useState<ErrorLog | undefined>(undefined);
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const fetch = async () => {
    try {
      const response = await axiosClient.get(`logs/${errorLog?.id}`);
      if (response.status === 200) {
        setUserData(response.data);
      }
    } catch (error: any) {
      console.log(error);
    }
    setFetching(false);
  };
  useEffect(() => {
    fetch();
  }, []);

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
          {t("logs")}
        </CardTitle>
      </CardHeader>
      {fetching ? (
        loader
      ) : (
        <>
          <CardContent className="space-y-4 text-sm text-start">
            {userData ? (
              <>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("error_code")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.error_code ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("message")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.error_message ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("exception_type")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.exception_type ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("user_id")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.user_id ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("username")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.username ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("ip_address")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.ip_address ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("method")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.method ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2 flex-wrap">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("uri")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.uri ?? "N/K"}
                  </span>
                </p>
                <Accordion
                  type="single"
                  collapsible
                  className="border-t border-primary/5 my-1"
                >
                  <AccordionItem value="trace">
                    <AccordionTrigger className="font-semibold py-1 rtl:text-lg-rtl">
                      {t("trace")}
                    </AccordionTrigger>
                    <AccordionContent className="ltr:text-sm text-primary/80 whitespace-pre-wrap break-words break-all text-wrap">
                      {userData.trace ?? "N/K"}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <p>{t("no_log_data_found")}</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              className="rtl:text-xl-rtl ltr:text-lg-ltr"
              variant="outline"
              onClick={() => {
                modelOnRequestHide();
                onClose();
              }}
            >
              {t("close")}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
