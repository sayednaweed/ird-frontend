import type { ValidationRule } from "@/validation/types";

export function isValidationFunction(
  rule: ValidationRule
): rule is (value: any) => boolean {
  return typeof rule === "function";
}
