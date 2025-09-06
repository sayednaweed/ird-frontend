import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import type { Audit } from "@/database/models";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import axiosClient from "@/lib/axois-client";
import PrintReport from "@/components/custom-ui/resuseable/print-report";
import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";
import { toast } from "sonner";

export interface AuditDetailsDialogProps {
  audit?: Audit;
  onClose: () => void;
}

export default function AuditDetailsDialog(props: AuditDetailsDialogProps) {
  const { onClose, audit } = props;
  const [fetching, setFetching] = useState(true);
  const [userData, setUserData] = useState<Audit | undefined>(undefined);
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  const start = useDownloadStore((s) => s.startDownload);

  const fetch = async () => {
    try {
      const response = await axiosClient.get(`audits/${audit?.id}`);
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
  const oldParsed = JSON.parse(userData?.old_values || "{}");
  const newParsed = JSON.parse(userData?.new_values || "{}");
  const allKeys = Array.from(
    new Set([...Object.keys(oldParsed), ...Object.keys(newParsed)])
  );
  const formatLines = (
    data: Record<string, any>,
    compareTo: Record<string, any>,
    isOld: boolean
  ) => {
    return allKeys.map((key) => {
      const value = data[key];
      const otherValue = compareTo[key];
      const isChanged = value !== otherValue;

      const colorClass = isChanged
        ? isOld
          ? "text-red-400"
          : "text-green-400"
        : "text-gray-300";

      return (
        <div key={key} className={`${colorClass}`}>
          &nbsp;&nbsp;{key}: '{String(value)}',
        </div>
      );
    });
  };
  const printPdf = () => {
    // 1. Validate
    if (!userData) {
      toast.error(t("error"));
      return;
    }

    start({
      id: crypto.randomUUID(),
      filename: `${t("reports")}.pdf`,
      url: `audits/generate/pdf-report/${audit?.id}`,
    });
  };
  const printExcel = () => {
    // 1. Validate
    if (!userData) {
      toast.error(t("error"));
      return;
    }
    start({
      id: crypto.randomUUID(),
      filename: `${t("reports")}.xlsx`,
      url: `audits/generate/excel-report/${audit?.id}`,
    });
  };
  return (
    <Card className="w-full px-2 md:w-fit md:min-w-[700px] self-center bg-card my-12">
      <CardHeader className="relative text-start flex justify-between">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {t("logs")}
        </CardTitle>
        <PrintReport
          onGeneratePdfClick={printPdf}
          onGenerateExcelClick={printExcel}
          className="sm:ltr:mr-3 sm:rtl:ml-3 self-center mt-2 size-5"
        />
      </CardHeader>
      {fetching ? (
        loader
      ) : (
        <>
          <CardContent className="space-y-2 text-sm text-start">
            {userData ? (
              <>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("id")}:
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.id ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("user")}:
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.user_type ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("user_id")}:
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.user_id ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("username")}:
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.username ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("event")}:
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.event ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("table")}:
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.table ?? "N/K"}
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
                    {userData.id ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2 flex-wrap">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("uri")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.user_type ?? "N/K"}
                  </span>
                </p>
                <p className="flex gap-x-2 flex-wrap">
                  <span className="font-semibold rtl:text-lg-rtl">
                    {t("browser")}
                  </span>
                  <span className="break-words break-all text-wrap">
                    {userData.user_agent ?? "N/K"}
                  </span>
                </p>
                <Accordion
                  type="single"
                  collapsible
                  className="border-t border-primary/5 my-1"
                >
                  <AccordionItem value="trace">
                    <AccordionTrigger className="font-semibold py-1 rtl:text-lg-rtl">
                      {t("changes")}
                    </AccordionTrigger>
                    <AccordionContent className="ltr:text-sm text-primary/80 whitespace-pre-wrap break-words break-all text-wrap">
                      <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
                        {/* OLD VALUES */}
                        <div className="bg-gray-900 dark:bg-secondary rounded-lg p-4 shadow text-white">
                          <div className="text-gray-400 mb-2">
                            // {t("old_values")}
                          </div>
                          <div>{"{"}</div>
                          {formatLines(oldParsed, newParsed, true)}
                          <div>{"}"}</div>
                        </div>

                        {/* NEW VALUES */}
                        <div className="bg-gray-900 dark:bg-secondary rounded-lg p-4 shadow text-white">
                          <div className="text-gray-400 mb-2">
                            // {t("new_values")}
                          </div>
                          <div>{"{"}</div>
                          {formatLines(newParsed, oldParsed, false)}
                          <div>{"}"}</div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </>
            ) : (
              <p>{t("no_audit_found")}</p>
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
