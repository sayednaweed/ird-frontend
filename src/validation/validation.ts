import { t } from "i18next";
import { isValidationFunction } from "./utils";
import { isFile, isString } from "@/lib/utils";
import type { ValidateItem, ValidationRule } from "@/validation/types";
import type { Dispatch, SetStateAction } from "react";

const validateFieldType = (
  errMap: Map<string, string>,
  value: string,
  item: ValidateItem
): "return" | "break" | "none" => {
  // 1. If value is object return hence has a value
  if (Array.isArray(value)) {
    if (value.length == 0) {
      errMap.set(item.name, `${t(item.name)} ${t("is_required")}`);
      return "break";
    }
  } else if (typeof value === "object") {
    return "return";
  }
  // 1. If value is File return hence has a value
  if (isFile(value)) {
    return "return";
    // 1. If value is boolean return hence has a value
  } else if (typeof value === "boolean") {
    return "return";
  } else if (value == undefined) {
    errMap.set(item.name, `${t(item.name)} ${t("is_required")}`);
    // Allow one validation per loop to eliminate to much Rerender
    return "break";
  } else if (isString(value) && value.trim() == "") {
    errMap.set(item.name, `${t(item.name)} ${t("is_required")}`);
    // Allow one validation per loop to eliminate to much Rerender
    return "break";
  }
  return "none";
};
export const validate = async (
  inputs: ValidateItem[],
  vData: any,
  setVError: Dispatch<SetStateAction<Map<string, string>>>
) => {
  const errMap = new Map<string, string>();

  inputs.forEach((item: ValidateItem) => {
    const value: string = vData[item.name];

    for (let index = 0; index < item.rules.length; index++) {
      const rule: ValidationRule = item.rules[index];
      if (isValidationFunction(rule)) {
        const failed = rule(vData);
        if (failed)
          errMap.set(item.name, `${t(item.name)} ${t("is_required")}`);
        break;
      } else if (rule == "required") {
        const result = validateFieldType(errMap, value, item);
        if (result == "break") {
          break;
        } else if (result == "return") {
          return;
        }
      } else if (rule == "phone") {
        console.log(value?.length < 12);

        if (value.startsWith("+93") && value?.length != 12) {
          errMap.set(item.name, `${t(item.name)} ${t("afg_contact_val")}`);
        } else if (value?.length < 6) {
          errMap.set(item.name, `${t(item.name)} ${t("is_required")}`);
        }
      } else if (isString(rule)) {
        const parts = rule.split(":");
        const length: number = parseInt(parts[1]);
        if ("max" == parts[0]) {
          if (value.length > length) {
            errMap.set(
              item.name,
              `${t(item.name)} ${t("is_more_than")} ${length} ${t("character")}`
            );
            // Allow one validation per loop to eliminate to much Rerender
            break;
          }
        }
        if ("min" == parts[0]) {
          if (value.length < length) {
            errMap.set(
              item.name,
              `${t(item.name)} ${t("is_less_than")} ${length} ${t("character")}`
            );
            // Allow one validation per loop to eliminate to much Rerender
            break;
          }
        }
        const floatLength: number = parseFloat(parts[1]);

        if ("equal" == parts[0]) {
          if (parseFloat(value) > floatLength) {
            errMap.set(
              item.name,
              `${t(item.name)} ${t("is_more_than")} ${floatLength.toFixed(2)}`
            );
            // Allow one validation per loop to eliminate to much Rerender
            break;
          } else if (parseFloat(value) < floatLength) {
            errMap.set(
              item.name,
              `${t(item.name)} ${t("is_less_than")} ${floatLength.toFixed(2)}`
            );
            // Allow one validation per loop to eliminate to much Rerender
            break;
          }
        }
      }
    }
  });

  // Set if errors founds or set empty map if sucessfull.
  setVError(errMap);
  if (errMap.size == 0) {
    return true;
  }
  return false;
};

export const setServerError = (
  serverErrors: any,
  setError: Dispatch<SetStateAction<Map<string, string>>>
) => {
  const errMap = new Map<string, string>();
  for (const key in serverErrors) {
    errMap.set(key, serverErrors[key][0]);
  }
  setError(errMap);
};

export const separateFieldName = (fieldName: string): string => {
  // Replace capital letters with space followed by lowercase letters
  let separatedString = fieldName.replace(/(?<!^)([A-Z])/g, " $1");

  // Capitalize the first letter of the first word
  separatedString =
    separatedString.charAt(0).toUpperCase() + separatedString.slice(1);

  return separatedString;
};
