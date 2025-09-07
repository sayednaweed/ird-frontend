import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-multi-date-picker";
import DateObject from "react-date-object";
import { useTranslation } from "react-i18next";
import {
  afgMonthNamesEn,
  afgMonthNamesFa,
  CALENDAR,
  CALENDAR_LOCALE,
} from "@/lib/constants";
import { useGlobalState } from "@/context/GlobalStateContext";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import DatePanel from "react-multi-date-picker/plugins/date_panel";

export interface CustomMultiDatePickerProps {
  dateOnComplete: (selectedDates: DateObject[]) => void;
  value: DateObject[];
  className?: string;
}

export default function CustomMultiDatePicker(
  props: CustomMultiDatePickerProps
) {
  const { dateOnComplete, value, className } = props;
  const [state] = useGlobalState();
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const [visible, setVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateObject[]>(value);
  const calendarRef = useRef<any>(null);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      calendarRef.current &&
      !calendarRef.current.contains(event.target as Node)
    ) {
      setVisible(false);
    }
  };

  const handleDateChange = (selectedDates: DateObject[]) => {
    dateOnComplete(selectedDates);
    setSelectedDates(selectedDates);
  };

  const onVisibilityChange = () => setVisible(!visible);

  let months: any = [];
  if (state.systemLanguage.info.calendarId === CALENDAR.SOLAR) {
    if (state.systemLanguage.info.localeId === CALENDAR_LOCALE.farsi) {
      months = afgMonthNamesFa;
    } else if (state.systemLanguage.info.localeId === CALENDAR_LOCALE.english) {
      months = afgMonthNamesEn;
    }
  }

  return (
    <div dir={direction} className="relative w-full max-w-sm">
      {visible && (
        <Calendar
          value={selectedDates}
          ref={calendarRef}
          className="absolute z-10 font-segoe top-14"
          onChange={handleDateChange}
          months={months}
          range
          plugins={[<DatePanel position="top" className="h-32" />]}
          calendar={state.systemLanguage.calendar}
          locale={state.systemLanguage.local}
        />
      )}

      <div
        className={cn(
          `bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 
          rounded px-4 py-2 min-h-[44px] cursor-pointer shadow-sm 
          hover:shadow-md transition-shadow duration-200 flex items-center flex-wrap gap-2`,
          className
        )}
        onClick={onVisibilityChange}
      >
        <CalendarDays className="w-4 h-4 text-primary/80" />

        {selectedDates && selectedDates.length > 0 ? (
          selectedDates.map((date: DateObject, index: number) => (
            <div
              key={index}
              className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-2 py-1 rounded text-sm"
            >
              {index % 2 === 1 && (
                <span className="text-gray-500 dark:text-gray-400 font-medium">
                  {state.systemLanguage.info.localeId ===
                    CALENDAR_LOCALE.farsi ||
                  state.systemLanguage.info.localeId === CALENDAR_LOCALE.arabic
                    ? "به"
                    : "to"}
                </span>
              )}
              <span>
                {date
                  .convert(
                    state.systemLanguage.calendar,
                    state.systemLanguage.local
                  )
                  .format()}
              </span>
            </div>
          ))
        ) : (
          <span className="text-gray-400 dark:text-gray-500 text-sm">
            {t("select_a_date")}
          </span>
        )}
      </div>
    </div>
  );
}
