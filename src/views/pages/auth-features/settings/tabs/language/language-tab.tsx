import { useGlobalState } from "@/context/GlobalStateContext";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { CACHE, CALENDAR, CALENDAR_FORMAT } from "@/lib/constants";
import { getCalender } from "@/lib/utils";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import LanguageChanger from "@/components/custom-ui/navbar/language-changer";
export default function LanguageTab() {
  const [state, dispatch] = useGlobalState();
  const { updateComponentCache } = useCacheDB();
  const [calender, setCalendar] = useState(
    state.systemLanguage.info.calendarId
  );
  const [locale, setLocale] = useState(state.systemLanguage.info.localeId);
  const [format, setFormat] = useState(state.systemLanguage.format);
  const { t } = useTranslation();
  const onChangeCalendar = (value: string) => {
    const { locale, calender, calendarId, localeId } = getCalender(
      value,
      state.systemLanguage.info.localeId
    );
    dispatch({
      type: "changeLanguage",
      payload: {
        calendar: calender,
        local: locale,
        info: {
          calendarId: calendarId,
          localeId: localeId,
        },
        format: state.systemLanguage.format,
      },
    });
    updateComponentCache({
      key: CACHE.SYSTEM_CALENDAR,
      value: {
        calendarId: calendarId,
        localeId: localeId,
        format: state.systemLanguage.format,
      },
    });
    setCalendar(value);
  };
  const onChangeLocale = (value: string) => {
    const { locale, calender, calendarId, localeId } = getCalender(
      state.systemLanguage.info.calendarId,
      value
    );
    dispatch({
      type: "changeLanguage",
      payload: {
        calendar: calender,
        local: locale,
        info: {
          calendarId: calendarId,
          localeId: localeId,
        },
        format: state.systemLanguage.format,
      },
    });
    updateComponentCache({
      key: CACHE.SYSTEM_CALENDAR,
      value: {
        calendarId: calendarId,
        localeId: localeId,
        format: state.systemLanguage.format,
      },
    });
    setLocale(value);
  };
  const onChangeFormat = (value: string) => {
    dispatch({
      type: "changeLanguage",
      payload: {
        calendar: state.systemLanguage.calendar,
        local: state.systemLanguage.local,
        info: {
          calendarId: state.systemLanguage.info.calendarId,
          localeId: state.systemLanguage.info.localeId,
        },
        format: value,
      },
    });
    updateComponentCache({
      key: CACHE.SYSTEM_CALENDAR,
      value: {
        calendarId: state.systemLanguage.info.calendarId,
        localeId: state.systemLanguage.info.localeId,
        format: value,
      },
    });
    setFormat(value);
  };
  const defaultGroupText = "rtl:[&>*]:text-lg-rtl ltr:[&>*]:text-xl-ltr";
  const defaultLabelText = "rtl:text-2xl-rtl ltr:text-lg-ltr rtl:px-1";
  const defaultText =
    "rtl:text-xl-rtl ltr:text-xl-ltr bg-card ring-0 focus:ring-0 w-full";
  return (
    <section className="select-none px-8 pt-4 gap-y-4 flex flex-col w-full sm:w-1/2">
      <div>
        <Label className={defaultLabelText}>{t("system_language")}</Label>
        <LanguageChanger className="rounded-md w-full" />
      </div>
      <div>
        <Label className={defaultLabelText}>{t("system_calendar")}</Label>
        <Select onValueChange={onChangeCalendar} value={calender}>
          <SelectTrigger className={`${defaultText}`}>
            <SelectValue placeholder={t("select_sys_cal")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className={defaultGroupText}>
              <SelectLabel className="">{t("calendars")}</SelectLabel>
              <SelectItem value={CALENDAR.Gregorian}>
                {t("gregorian")}
              </SelectItem>
              <SelectItem value={CALENDAR.SOLAR}>{t("solar_hijri")}</SelectItem>
              <SelectItem value={CALENDAR.LUNAR}>{t("lunar_hijri")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className={defaultLabelText}>{t("calendar_locale")}</Label>
        <Select onValueChange={onChangeLocale} value={locale}>
          <SelectTrigger className={`${defaultText}`}>
            <SelectValue placeholder={t("select_calendar_locale")} />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className={defaultGroupText}>
              <SelectLabel>{t("locales")}</SelectLabel>
              <SelectItem value={CALENDAR.Gregorian}>{t("english")}</SelectItem>
              <SelectItem value={CALENDAR.SOLAR}>{t("farsi")}</SelectItem>
              <SelectItem value={CALENDAR.LUNAR}>{t("arabic")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className={defaultLabelText}>{t("calendar_format")}</Label>
        <Select onValueChange={onChangeFormat} value={format}>
          <SelectTrigger className={`${defaultText}`}>
            <SelectValue
              className="text-header2"
              placeholder={t("select_calendar_format")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className={defaultGroupText}>
              <SelectLabel>{t("formats")}</SelectLabel>
              <SelectItem value={CALENDAR_FORMAT.format_1}>
                {t("format_1")}
              </SelectItem>
              <SelectItem value={CALENDAR_FORMAT.format_2}>
                {t("format_2")}
              </SelectItem>
              <SelectItem value={CALENDAR_FORMAT.format_3}>
                {t("format_3")}
              </SelectItem>
              <SelectItem value={CALENDAR_FORMAT.format_4}>
                {t("format_4")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </section>
  );
}
