import CustomInput from "@/components/custom-ui/input/CustomInput";
import type { Schedule } from "@/database/models";
import type { Dispatch } from "react";
import { useTranslation } from "react-i18next";

export interface CustomProjectSelectProps {
  schedule: Schedule;
  setSchedule: Dispatch<any>;
}

export function NormalProject(props: CustomProjectSelectProps) {
  const { schedule, setSchedule } = props;
  const { t } = useTranslation();

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    if (Number(value)) {
      if (schedule.special_projects) {
        const sliced = schedule.special_projects.slice(0, value);

        setSchedule((prev: any) => ({
          ...prev,
          special_projects: sliced,
          scheduleItems: [],
          [name]: value,
        }));
      } else {
        setSchedule((prev: any) => ({ ...prev, [name]: value }));
      }
    }
  };
  return (
    <div className="flex flex-col gap-x-4 gap-y-6 w-full sm:w-1/2 xl:w-1/3 2xl:h-1/4">
      <CustomInput
        size_="sm"
        dir="ltr"
        className="rtl:text-end"
        placeholder={t("presentation_count")}
        value={schedule["presentation_count"] || ""}
        type="text"
        name="presentation_count"
        onChange={handleChange}
      />
    </div>
  );
}
