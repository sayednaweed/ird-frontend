import { useEffect, useRef, useState } from "react";
import { Calendar } from "react-multi-date-picker";
import DateObject from "react-date-object";
import { useTranslation } from "react-i18next";

import { useGlobalState } from "@/context/GlobalStateContext";
import { cn, isString } from "@/lib/utils";
import { CalendarDays } from "lucide-react";
import {
  afgMonthNamesEn,
  afgMonthNamesFa,
  CALENDAR,
  CALENDAR_LOCALE,
} from "@/lib/constants";

export interface CustomeDatePickerProps {
  dateOnComplete: (date: DateObject) => boolean | void;
  value: DateObject | undefined | string;
  className?: string;
  parentClassName?: string;
  placeholder: string;
  place?: string;
  required?: boolean;
  requiredHint?: string;
  hintColor?: string;
  lable?: string;
  errorMessage?: string;
  readonly?: boolean;
  bottom?: boolean;
}

export default function CustomDatePicker(props: CustomeDatePickerProps) {
  const {
    dateOnComplete,
    value,
    className,
    parentClassName,
    placeholder,
    required,
    requiredHint,
    hintColor,
    lable,
    errorMessage,
    readonly,
    bottom,
  } = props;
  const [state] = useGlobalState();
  const { i18n } = useTranslation();
  const direction = i18n.dir();

  const [visible, setVisible] = useState(false);
  const [selectedDates, setSelectedDates] = useState<DateObject | undefined>(
    isString(value) ? new DateObject(new Date(value)) : value
  );

  const calendarWrapperRef = useRef<HTMLDivElement | null>(null);
  const calenderParentRef = useRef<HTMLDivElement | null>(null);

  // Close calendar on outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarWrapperRef.current &&
        !calendarWrapperRef.current.contains(event.target as Node) &&
        calenderParentRef.current &&
        !calenderParentRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const formatHijriDate = (date?: DateObject) => {
    try {
      if (date) {
        const format = state.systemLanguage.format;
        return date
          .convert(state.systemLanguage.calendar, state.systemLanguage.local)
          .format(format);
      }
    } catch (e: any) {
      console.log(e, "CustomDatePicker");
    }
    return undefined;
  };

  const handleDateChange = (date: DateObject) => {
    setVisible(false);
    const failed = dateOnComplete(date);
    if (failed) return;
    setSelectedDates(date);
  };

  const onVisibilityChange = () => {
    if (!readonly) setVisible((v) => !v);
  };

  let months: any = [];
  if (state.systemLanguage.info.calendarId === CALENDAR.SOLAR) {
    if (state.systemLanguage.info.localeId === CALENDAR_LOCALE.farsi) {
      months = afgMonthNamesFa;
    } else if (state.systemLanguage.info.localeId === CALENDAR_LOCALE.english) {
      months = afgMonthNamesEn;
    }
  }

  return (
    <div
      dir={direction}
      ref={calenderParentRef}
      className={cn("relative", parentClassName)}
    >
      {/* Calendar portal */}
      {visible && (
        <div
          ref={calendarWrapperRef}
          style={{
            zIndex: 9999,
            backgroundColor: "white",
            boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            borderRadius: "6px",
          }}
          className={`absolute ${bottom ? "-bottom-62" : "-top-62"}`}
        >
          <Calendar
            value={selectedDates}
            onChange={handleDateChange}
            months={months}
            calendar={state.systemLanguage.calendar}
            locale={state.systemLanguage.local}
            // Remove any conflicting absolute classes
          />
        </div>
      )}

      {/* Input / trigger div */}
      <div
        className={cn(
          `border relative px-3 py-1 rounded ${
            readonly ? "cursor-not-allowed" : "cursor-pointer"
          } ${required || lable ? "mt-[20px]" : "mt-2"} ${
            errorMessage ? "border-red-400" : "border-gray-300"
          }`,
          className
        )}
        onClick={onVisibilityChange}
      >
        {required && (
          <span
            className={cn(
              "text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-[10px] rtl:left-[10px] -top-[17px] absolute font-semibold",
              hintColor
            )}
          >
            {requiredHint}
          </span>
        )}

        {selectedDates ? (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-lg-rtl ltr:text-lg-ltr text-primary/80 whitespace-nowrap overflow-hidden">
            <CalendarDays className="size-[16px] w-4 h-4 text-primary/80 inline-block rtl:ml-2 rtl:mr-2" />
            {formatHijriDate(selectedDates)}
          </h1>
        ) : (
          <h1 className="flex items-center gap-x-2 text-ellipsis rtl:text-lg-rtl ltr:text-lg-ltr font-semibold text-primary whitespace-nowrap overflow-hidden">
            <CalendarDays className="size-[16px] w-4 h-4 text-primary/80 inline-block" />
            {placeholder}
          </h1>
        )}

        {lable && (
          <label
            htmlFor={lable}
            className="rtl:text-lg-rtl ltr:text-xl-ltr rtl:right-[4px] ltr:left-[4px] ltr:-top-[22px] rtl:-top-[24px] absolute font-semibold"
          >
            {lable}
          </label>
        )}
      </div>

      {errorMessage && (
        <h1 className="rtl:text-sm-rtl ltr:text-sm-ltr capitalize text-start text-red-400">
          {errorMessage}
        </h1>
      )}
    </div>
  );
}
