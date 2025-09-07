import CustomMultiDatePicker from "@/components/custom-ui/datePicker/CustomMultiDatePicker";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import type { Schedules } from "@/database/models";
import { useDatasource } from "@/hook/use-datasource";
import axiosClient from "@/lib/axois-client";
import { generateUUID, isSameDatePure, isStartDateSmaller } from "@/lib/utils";
import { CalendarMinus, CalendarPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { useNavigate } from "react-router";

export default function Schedules() {
  const [date, setDate] = useState<DateObject[]>([
    new DateObject(new Date()),
    new DateObject(new Date().setMonth(new Date().getMonth() + 1)),
  ]);
  const { t } = useTranslation();

  const navigate = useNavigate();
  const transformSchedules = (data: Schedules[]) => {
    // List to store day names and dates
    const startDate = date[0];
    const endDate = date[1];
    let current = new DateObject(startDate);

    const daysBetween: {
      id: string;
      day: string;
      date: string;
      weekday: string;
      data: Schedules | null;
    }[] = [];

    while (current.toDate().getTime() <= endDate.toDate().getTime()) {
      let matchedData: Schedules | null = null;

      for (const item of data) {
        const compareDate = new DateObject(new Date(item.date));
        if (isSameDatePure(current.toDate(), compareDate.toDate())) {
          matchedData = item; // You can also store `item.data` if available
          break;
        }
      }
      daysBetween.push({
        id: generateUUID(),
        day: current.format("DD"),
        date: current.format("YYYY/MM/DD"),
        weekday: current.weekDay.name,
        data: matchedData,
      });

      current = current.add(1, "day");
    }

    return daysBetween;
  };
  const loadList = async () => {
    // 2. Send data
    const response = await axiosClient.get(`schedules`, {
      params: {
        start_date: date[0].toDate().toISOString(),
        end_date: date[1].toDate().toISOString(),
      },
    });
    return transformSchedules(response.data);
  };
  const { schedules, isLoading } = useDatasource<
    {
      id: string;
      date: string;
      day: string;
      weekday: string;
      data: Schedules | null;
    }[],
    "schedules"
  >(
    {
      queryFn: loadList,
      queryKey: "schedules",
    },
    [date],
    []
  );
  const handleDate = (selectedDates: DateObject[]) => {
    if (selectedDates.length == 2) setDate(selectedDates);
  };

  const loaderComponent = useMemo(
    () => (
      <>
        <NastranSpinner />
      </>
    ),
    []
  );
  return (
    <div className="space-y-6 px-4 pt-4 pb-12">
      <CustomMultiDatePicker
        className="w-fit bg-white dark:bg-gray-900 shadow-md rounded-md"
        value={date}
        dateOnComplete={handleDate}
      />

      {isLoading ? (
        loaderComponent
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-6">
          {schedules.map((item) => {
            const inputDate = new Date(item.date);
            const currentDate = new Date();
            const notAllowed = isStartDateSmaller(inputDate, currentDate);

            return (
              <div
                key={item.id}
                className={`
              group border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 bg-white dark:bg-gray-900 
              hover:shadow-lg hover:-translate-y-1 transition-all duration-300
              ${notAllowed ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
            `}
              >
                {/* Header: Date and Weekday */}
                <div className="flex justify-between items-center mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">
                  <span>{item.day}</span>
                  <span>{item.weekday}</span>
                </div>

                {/* Body: Scheduled or Not */}
                {item?.data ? (
                  <div
                    className="text-center space-y-2"
                    onClick={() =>
                      navigate(`/dashboard/schedules/${item.data?.id}`)
                    }
                  >
                    <CalendarMinus className="w-5 h-5 text-red-500 mx-auto" />
                    <div className="font-semibold text-gray-800 dark:text-white">
                      {item.data.status}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (!notAllowed)
                        navigate(`/dashboard/schedules/${item.date}`);
                    }}
                    className="text-center space-y-2"
                  >
                    <CalendarPlus className="w-5 h-5 text-primary mx-auto" />
                    <h1 className="text-sm text-gray-500 dark:text-gray-400">
                      {t("not_scheduled")}
                    </h1>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
