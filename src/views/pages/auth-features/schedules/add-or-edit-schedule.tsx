import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import EditScheduleTab from "./tabs/edit-schedule-tab";

import { DateObject } from "react-multi-date-picker";
import { useGlobalState } from "@/context/GlobalStateContext";
import axiosClient from "@/lib/axois-client";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { PlaneTakeoff, SquareX } from "lucide-react";
import { useDatasource } from "@/hook/use-datasource";
import type { Schedule } from "@/database/models";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import { NormalProject } from "@/views/pages/auth-features/schedules/tabs/normal-project";
import { UrgentProject } from "@/views/pages/auth-features/schedules/tabs/urgent-project";
import { ScheduleStatusEnum } from "@/database/model-enums";

export default function AddOrEditSchedule() {
  const { t, i18n } = useTranslation();
  const [state] = useGlobalState();
  const [tab, setTab] = useState<string>("count");
  const direction = i18n.dir();
  const { data, "*": restPath } = useParams();
  const fullDate = restPath ? `${data}/${restPath}` : data;
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const handleGoBack = () =>
    navigate("/dashboard/schedules", { replace: true });
  const paramData = useMemo(
    () =>
      new DateObject({
        date: fullDate,
        calendar: state.systemLanguage.calendar,
        locale: state.systemLanguage.local,
        format: "YYYY/MM/DD", // important for parsing correctly
      }),
    []
  );
  const loadList = async () => {
    if (paramData.isValid) {
      return {
        date: paramData,
        presentation_count: 10,
        projects: [],
        special_projects: [],
        scheduleItems: [],
        start_time: "08:00",
        end_time: "16:00",
        is_hour_24: false,
        presentation_length: 45,
        gap_between: 5,
        lunch_start: "12:30",
        lunch_end: "13:30",
        dinner_start: "",
        dinner_end: "",
        presentations_before_lunch: 0,
        presentations_after_lunch: 0,
        passed: false,
      };
    } else {
      const response = await axiosClient.get(`schedules/${data}`);
      const sch = response.data;
      const scheduleDate = new Date(response.data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Also zero out scheduleDate time to compare just the date part
      scheduleDate.setHours(0, 0, 0, 0);

      if (scheduleDate < today) {
        sch.passed = true;
      }
      sch.date = new DateObject(new Date(response.data.date));
      return sch;
    }
  };
  const { schedule, setSchedule } = useDatasource<Schedule | any, "schedule">(
    {
      queryFn: loadList,
      queryKey: "schedule",
    },
    [],
    []
  );

  const tabStyle =
    "border-0 cursor-pointer data-[state=active]:bg-tertiary/5 data-[state=active]:border-tertiary grow-0 text-muted-foreground transition-colors duration-300 data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:border-b-[2px] h-full rounded-none";

  const cancel = () => {
    try {
    } catch (error: any) {}
  };
  const isPending =
    schedule?.schedule_status_id == ScheduleStatusEnum.Scheduled;
  return (
    <div className="px-2 pt-2 pb-12 flex flex-col gap-y-[2px] relative select-none rtl:text-2xl-rtl ltr:text-xl-ltr">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleGoBack}>{t("schedules")}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>{fullDate}</BreadcrumbItem>
      </Breadcrumb>
      <Card className="w-full mt-2 self-center [backdrop-filter:blur(20px)] bg-card">
        <CardHeader className="text-start sticky top-0 rounded-t-lg border-b bg-card z-10 flex flex-row items-center justify-between">
          <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
            {t("schedule")}
          </CardTitle>
          <div className="flex gap-x-4">
            {!paramData.isValid && !schedule.passed && (
              <>
                <PrimaryButton
                  onClick={() =>
                    navigate(
                      `/dashboard/schedules/start/presentation/${schedule?.id}`
                    )
                  }
                  className="items-center border bg-primary/5 hover:shadow-none shadow-none text-primary hover:text-primary hover:bg-primary/10"
                >
                  {t(isPending ? "start_resentation" : "view")}
                  <PlaneTakeoff />
                </PrimaryButton>
                {isPending && (
                  <PrimaryButton
                    onClick={cancel}
                    className="items-center border bg-red-400/20 hover:shadow-none shadow-none text-primary hover:text-primary hover:bg-red-400/70"
                  >
                    {t("cancel")}
                    <SquareX />
                  </PrimaryButton>
                )}
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-y-4 p-0 pb-4 text-start">
          <Tabs
            onValueChange={setTab}
            dir={direction}
            className="p-0 h-full space-y-0"
            value={tab}
          >
            <TabsList className="overflow-x-auto border-b overflow-y-hidden bg-card w-full justify-start p-0 m-0 rounded-none">
              <TabsTrigger value={"count"} className={tabStyle}>
                <div className="rounded-full data-[state=active]:bg-tertiary bg-primary ltr:mr-2 rtl:ml-2 text-primary-foreground size-[21px] flex items-center justify-center shadow-md ltr:text-[12px]">
                  <span
                    className={
                      tab == "count"
                        ? "text-tertiary"
                        : "text-primary-foreground"
                    }
                  >
                    1
                  </span>
                </div>
                {t("present_count")}
              </TabsTrigger>
              <TabsTrigger value={"urgent"} className={tabStyle}>
                <div className="rounded-full bg-primary ltr:mr-2 rtl:ml-2 text-primary-foreground size-[21px] flex items-center justify-center shadow-md ltr:text-[12px]">
                  <span
                    className={
                      tab == "urgent"
                        ? "text-tertiary"
                        : "text-primary-foreground"
                    }
                  >
                    2
                  </span>
                </div>
                {t("urgent")}
              </TabsTrigger>
              <TabsTrigger value={"detail"} className={tabStyle}>
                <div className="rounded-full bg-primary ltr:mr-2 rtl:ml-2 text-primary-foreground size-[21px] flex items-center justify-center shadow-md ltr:text-[12px]">
                  <span
                    className={
                      tab == "detail"
                        ? "text-tertiary"
                        : "text-primary-foreground"
                    }
                  >
                    3
                  </span>
                </div>
                {t("detail")}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={"count"} className="p-4">
              <NormalProject schedule={schedule} setSchedule={setSchedule} />
            </TabsContent>
            <TabsContent value={"urgent"} className="p-4">
              <UrgentProject
                schedule={schedule}
                add={paramData.isValid}
                setSchedule={setSchedule}
              />
            </TabsContent>
            <TabsContent value={"detail"} className="p-4">
              <EditScheduleTab
                add={paramData.isValid}
                schedule={schedule}
                setSchedule={setSchedule}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
