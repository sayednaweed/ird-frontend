import type { SubPermission, UserPermission } from "@/database/models";
import { CALENDAR, CALENDAR_LOCALE } from "@/lib/constants";
import type { Configuration } from "@/lib/types";
import { clsx, type ClassValue } from "clsx";
import { DateObject } from "react-multi-date-picker";
import { twMerge } from "tailwind-merge";
import arabic_ar from "react-date-object/locales/arabic_ar";
import arabic_en from "react-date-object/locales/arabic_en";
import arabic_fa from "react-date-object/locales/arabic_fa";
import gregorian_fa from "react-date-object/locales/gregorian_fa";
import gregorian_ar from "react-date-object/locales/gregorian_ar";
import gregorian_en from "react-date-object/locales/gregorian_en";
import persian_fa from "react-date-object/locales/persian_fa";
import persian_ar from "react-date-object/locales/persian_ar";
import persian_en from "react-date-object/locales/persian_en";
import gregorian from "react-date-object/calendars/gregorian";
import arabic from "react-date-object/calendars/arabic";
import persian from "react-date-object/calendars/persian";
import { toast } from "sonner";
import { RoleEnum } from "@/database/model-enums";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const setConfiguration = (data: Configuration) => {
  localStorage.setItem(
    import.meta.env.VITE_TOKEN_STORAGE_KEY,
    JSON.stringify(data)
  );
};
export const getConfiguration = (): Configuration | null => {
  const data = localStorage.getItem(import.meta.env.VITE_TOKEN_STORAGE_KEY);
  if (data) return JSON.parse(data);
  else return null;
};
export const removeToken = () => {
  const configuration = getConfiguration();
  setConfiguration({
    ...configuration,
    token: undefined,
  });
};
export const setToken = (data: { type: string }) => {
  const configuration = getConfiguration();
  setConfiguration({
    ...configuration,
    type: data.type,
  });
};
export const returnPermissionsMap = (
  permissions: any
): Map<string, UserPermission> => {
  const permissionMap = new Map<string, UserPermission>();
  if (permissions != null || permissions != undefined) {
    for (let i = 0; i < permissions.length; i++) {
      const item: any = permissions[i];
      const subPermissions = item.sub as SubPermission[];
      const subMap: Map<number, SubPermission> = new Map(
        subPermissions.map((subPermission) => [subPermission.id, subPermission])
      );
      const permission: UserPermission = {
        id: item.user_permission_id,
        view: item.view,
        edit: item.edit,
        delete: item.delete,
        add: item.add,
        visible: item.visible,
        icon: item.icon,
        priority: item.priority,
        permission: item.permission,
        sub: subMap,
      };
      permissionMap.set(item.permission, permission);
    }
  }
  return permissionMap;
};

export const checkStrength = (pass: string, t: any) => {
  const requirements = [
    { regex: /.{8,}/, text: t("at_lea_8_char") },
    { regex: /[0-9]/, text: t("at_lea_1_num") },
    { regex: /[a-z]/, text: t("at_lea_1_lowcas_lett") },
    { regex: /[A-Z]/, text: t("at_lea_1_upcas_lett") },
  ];

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }));
};
export const passwordStrengthScore = (
  strength: {
    met: boolean;
    text: any;
  }[]
): number => strength.filter((req) => req.met).length;
export function isFile(input: any): input is File {
  return input instanceof File;
}
export const isString = (value: any) => typeof value === "string";
export function formatPhoneNumber(phone: string) {
  return phone.replace(/(\d{2})(\d{3})(\d{2})(\d{4})/, "$1 $2 $3 $4");
}
export const toLocaleDate = (date: Date, state: any) => {
  const format = state.systemLanguage.format;
  let object = { date, format };
  const gre = new DateObject(object)
    .convert(state.systemLanguage.calendar, state.systemLanguage.local)
    .format();
  return gre;
};

export const setDateToURL = (
  queryParams: URLSearchParams,
  selectedDates: DateObject[]
) => {
  if (selectedDates.length == 1) {
    queryParams.set(
      "st_dt",
      selectedDates[0].toDate().toISOString().split("T")[0] //2025-01-01
    );
  } else if (selectedDates.length == 2) {
    queryParams.set(
      "st_dt",
      selectedDates[0].toDate().toISOString().split("T")[0] //2025-01-01
    );
    queryParams.set(
      "en_dt",
      selectedDates[1].toDate().toISOString().split("T")[0] //2025-01-01
    );
  }
};
export const getCalender = (calendar: string, locale: string) => {
  //
  if (calendar === CALENDAR.Gregorian) {
    if (locale === CALENDAR_LOCALE.english) {
      return {
        locale: gregorian_en,
        calender: gregorian,
        calendarId: CALENDAR.Gregorian,
        localeId: CALENDAR_LOCALE.english,
      };
    } else if (locale === CALENDAR_LOCALE.arabic) {
      return {
        locale: gregorian_ar,
        calender: gregorian,
        calendarId: CALENDAR.Gregorian,
        localeId: CALENDAR_LOCALE.arabic,
      };
    } else {
      return {
        locale: gregorian_fa,
        calender: gregorian,
        calendarId: CALENDAR.Gregorian,
        localeId: CALENDAR_LOCALE.farsi,
      };
    }
  } else if (calendar === CALENDAR.SOLAR) {
    if (locale === CALENDAR_LOCALE.english) {
      return {
        locale: persian_en,
        calender: persian,
        calendarId: CALENDAR.SOLAR,
        localeId: CALENDAR_LOCALE.english,
      };
    } else if (locale === CALENDAR_LOCALE.arabic) {
      return {
        locale: persian_ar,
        calender: persian,
        calendarId: CALENDAR.SOLAR,
        localeId: CALENDAR_LOCALE.arabic,
      };
    } else {
      return {
        locale: persian_fa,
        calender: persian,
        calendarId: CALENDAR.SOLAR,
        localeId: CALENDAR_LOCALE.farsi,
      };
    }
  } else {
    if (locale === CALENDAR_LOCALE.english) {
      return {
        locale: arabic_en,
        calender: arabic,
        calendarId: CALENDAR.LUNAR,
        localeId: CALENDAR_LOCALE.english,
      };
    } else if (locale === CALENDAR_LOCALE.arabic) {
      return {
        locale: arabic_ar,
        calender: arabic,
        calendarId: CALENDAR.LUNAR,
        localeId: CALENDAR_LOCALE.arabic,
      };
    } else {
      return {
        locale: arabic_fa,
        calender: arabic,
        calendarId: CALENDAR.LUNAR,
        localeId: CALENDAR_LOCALE.farsi,
      };
    }
  }
};
export const validateFile = (
  file: File,
  maxFileSize: number,
  validTypes: string[],
  t: any
): File | undefined => {
  if (file.size >= maxFileSize) {
    toast.error(t("file_size_must_less") + maxFileSize / 1024 + "kb");
    return;
  }
  /** Type validation */
  if (!validTypes.includes(file.type)) {
    toast.error(t("ples_sel_vali_file") + validTypes.join(", "));
    return;
  }

  return file;
};
export const languageRegexMap: Record<string, RegExp> = {
  english: /^[a-zA-Z0-9\s.,!?'"()\-_:;@#%&*\/\\[\]{}<>+=|~`^$]+$/, // Includes common punctuation & symbols
  farsi:
    /^[\u0600-\u06FF\u06F0-\u06F9\s،؟؛«».:!٪'"()\-_:;@#٪&*\/\\[\]{}<>+=|~`^$]+$/, // Includes Persian symbols & punctuation
  pashto:
    /^[\u0600-\u06FF\u06F0-\u06F9\s،؟؛«».:!٪'"()\-_:;@#٪&*\/\\[\]{}<>+=|~`^$]+$/, // Same as Farsi for coverage
};
export const isNotAllowed = (id?: string) => {
  const parsedId = parseInt(id ?? "");
  return parsedId === RoleEnum.super || parsedId === RoleEnum.debugger;
};

export function getLangCode(lang: string) {
  if (lang === "en-US" || lang === "en") return "en";
  return lang;
}

// application
export const isStartDateBigger = (
  startDate: DateObject,
  endDate: DateObject,
  message?: string
) => {
  if (startDate && endDate && startDate > endDate) {
    if (message) toast.error(message);
    return true;
  }
  return false;
};
export const isStartDateSmaller = (startDate: Date, endDate: Date) => {
  if (startDate && endDate && startDate < endDate) {
    return true;
  }
  return false;
};
export function isSameDatePure(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}
export const valueIsNumber = (value: string) => {
  if (value === "" || /^\d*\.?\d*$/.test(value)) {
    return true;
  }
  return false;
};
export const isObjectEmpty = (obj: any) =>
  obj ? Object.keys(obj).length > 0 : false;
export const generateUUID = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);
export const budgetFailed = (
  totalBuget: number,
  totalProvince: number,
  t: any
) => {
  // 1. Check province budget is not more than total budget
  if (totalProvince > totalBuget) {
    toast.error(t("province_budget_exceeds"));
    return true;
  } else if (totalProvince <= 0) {
    // 2. Check province budget is not less than total budget
    toast.error(t("province_budget_falls"));
    return true;
  }
  return false;
};
