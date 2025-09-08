import { type Dispatch, useState } from "react";
import ScheduleTable from "./parts/ScheduleTable";
import { Separator } from "@/components/ui/separator";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import axiosClient from "@/lib/axois-client";
import { useTranslation } from "react-i18next";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { Save } from "lucide-react";
import { useNavigate } from "react-router";
import type {
  Project,
  Schedule,
  ScheduleItem,
  TimeSlot,
} from "@/database/models";
import { toast } from "sonner";
import type { FileType } from "@/lib/types";

const timeToDate = (time: string): Date => {
  const [hour, minute] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
};

const isInBreak = (
  start: Date,
  end: Date,
  breakStart: string,
  breakEnd: string
) => {
  const bStart = timeToDate(breakStart);
  const bEnd = timeToDate(breakEnd);
  return start < bEnd && end > bStart;
};

const generateSlots = (
  startTime: string,
  endTime: string,
  presentationLengthMinutes: number,
  gapMinutes: number,
  lunchBreak?: { start: string; end: string },
  dinnerBreak?: { start: string; end: string }
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const start = timeToDate(startTime);
  const end = timeToDate(endTime);
  let current = new Date(start);
  let id = 0;

  while (current < end) {
    const presentationStart = new Date(current);
    const presentationEnd = new Date(current);
    presentationEnd.setMinutes(
      presentationEnd.getMinutes() + presentationLengthMinutes
    );

    const gapEnd = new Date(presentationEnd);
    gapEnd.setMinutes(gapEnd.getMinutes() + gapMinutes);

    const inLunch =
      lunchBreak &&
      isInBreak(
        presentationStart,
        presentationEnd,
        lunchBreak.start,
        lunchBreak.end
      );
    const inDinner =
      dinnerBreak &&
      isInBreak(
        presentationStart,
        presentationEnd,
        dinnerBreak.start,
        dinnerBreak.end
      );

    if (!inLunch && !inDinner && presentationEnd <= end) {
      slots.push({
        id: id++,
        presentation_start: presentationStart.toTimeString().slice(0, 5),
        presentation_end: presentationEnd.toTimeString().slice(0, 5),
        gap_end: gapEnd.toTimeString().slice(0, 5),
      });
    }

    current = gapEnd;
  }

  return slots;
};

const formatTime12h = (time24: string): string => {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minute} ${ampm}`;
};

export interface EditScheduleTabProps {
  schedule: Schedule;
  setSchedule: Dispatch<any>;
  add: boolean;
}
const EditScheduleTab = (props: EditScheduleTabProps) => {
  const { schedule, setSchedule, add } = props;
  const [loading, setLoading] = useState(false);
  const [storing, setStoring] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const generateSchedule = (projects: Project[]) => {
    const lunch =
      schedule.lunch_start && schedule.lunch_end
        ? { start: schedule.lunch_start, end: schedule.lunch_end }
        : undefined;
    const dinner =
      schedule.dinner_start && schedule.dinner_end
        ? { start: schedule.dinner_start, end: schedule.dinner_end }
        : undefined;

    const slots = generateSlots(
      schedule.start_time,
      schedule.end_time,
      schedule.presentation_length,
      schedule.gap_between,
      lunch,
      dinner
    );

    const totalPresentations = projects.length;

    // Clamp the before and after lunch numbers so they don't exceed people count or slot counts
    let beforeCount = Math.min(
      schedule.presentations_before_lunch,
      totalPresentations
    );
    let afterCount = Math.min(
      schedule.presentations_after_lunch,
      totalPresentations - beforeCount
    );

    // If sum less than total presentations, adjust afterCount automatically
    if (beforeCount + afterCount < totalPresentations) {
      afterCount = totalPresentations - beforeCount;
    }

    const lunchStartDate = lunch ? timeToDate(lunch.start) : null;

    // Split slots into before lunch and after lunch
    const slotsBeforeLunch = lunchStartDate
      ? slots.filter(
          (slot) => timeToDate(slot.presentation_start) < lunchStartDate
        )
      : slots;

    const slotsAfterLunch = lunchStartDate
      ? slots.filter(
          (slot) => timeToDate(slot.presentation_start) >= lunchStartDate
        )
      : [];

    // Select slots for before and after lunch presentations, clamp by available slots too
    const selectedBeforeSlots = slotsBeforeLunch.slice(0, beforeCount);
    const selectedAfterSlots = slotsAfterLunch.slice(0, afterCount);

    // Combine and limit by totalPresentations
    const selectedSlots = [...selectedBeforeSlots, ...selectedAfterSlots].slice(
      0,
      totalPresentations
    );

    // Create schedule items with no assigned persons initially
    const items: ScheduleItem[] = selectedSlots.map((slot) => ({
      slot,
      projectId: null,
      project_name: undefined,
      attachment: undefined,
      selected: false,
    }));

    setSchedule((prev: Schedule) => ({
      ...prev,
      scheduleItems: items,
      projects: projects,
    }));
  };
  const prepareSchedule = async () => {
    try {
      if (loading) return;
      setLoading(true);
      const ids: number[] = [];
      schedule.special_projects.forEach((item) => ids.push(item.project.id));
      // 2. Send data
      const response = await axiosClient.get(`schedules/prepare`, {
        params: {
          count: schedule.presentation_count,
          ids: ids,
        },
      });
      const fetch = response.data as Project[];
      if (schedule.special_projects.length == 0) {
        generateSchedule(fetch);
        setSchedule((prev: Schedule) => ({
          ...prev,
          projects: fetch,
        }));
      } else {
        const combinedAttachment: Project[] = [];
        for (let i = 0; i < fetch.length; i++) {
          let foundItem = false;
          const item = fetch[i];

          for (let j = 0; j < schedule.special_projects.length; j++) {
            const subItem = schedule.special_projects[j];
            if (item.id == subItem.project.id) {
              foundItem = true;
              item.attachment = subItem.attachment;
              combinedAttachment.push(item);
              break;
            }
          }
          if (!foundItem) {
            combinedAttachment.push(item);
          }
        }

        generateSchedule(combinedAttachment);
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const assignPersonToSlot = (
    slotId: number,
    projectId: number | null,
    projectName: string | undefined,
    attachment: FileType | undefined,
    selected: boolean,
    action: "add" | "remove"
  ) => {
    const selectedId = action == "remove" ? null : projectId;
    const selectedProjectName = action == "remove" ? null : projectName;

    setSchedule((prev: Schedule) => {
      const updatedList = prev.scheduleItems.map((item) =>
        item.slot.id === slotId
          ? {
              ...item,
              projectId: selectedId,
              projectName: selectedProjectName,
              attachment: attachment,
            }
          : item
      );
      const updatedProjects = prev.projects.map((item) =>
        item.id === projectId
          ? { ...item, selected: selected, attachment: attachment }
          : item
      );
      return { ...prev, projects: updatedProjects, scheduleItems: updatedList };
    });
  };

  const formatTime = (time: string) => {
    return schedule.is_hour_24 ? time : formatTime12h(time);
  };
  const store = async () => {
    try {
      if (storing) return;
      setStoring(true);
      for (const item of schedule.scheduleItems) {
        if (!item.projectId) {
          toast.error(t("all_project_not_sele"));
          return;
        }
      }
      // 2. Send data
      const fixedDateUTC = new Date(
        Date.UTC(
          schedule.date.year,
          schedule.date.month.index,
          schedule.date.day
        )
      );

      const data = {
        id: schedule?.id,
        date: fixedDateUTC.toISOString(),
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        dinner_end: schedule.dinner_end,
        dinner_start: schedule.dinner_start,
        gap_between: schedule.gap_between,
        lunch_end: schedule.lunch_end,
        lunch_start: schedule.lunch_start,
        presentation_length: schedule.presentation_length,
        presentation_count: schedule.presentation_count,
        presentations_after_lunch: schedule.presentations_after_lunch,
        presentations_before_lunch: schedule.presentations_before_lunch,
        is_hour_24: schedule.is_hour_24,
        scheduleItems: schedule.scheduleItems,
      };
      const response = add
        ? await axiosClient.post(`schedules`, data)
        : await axiosClient.put(`schedules`, data);
      if (response.status == 200) {
        navigate("/dashboard/schedules");
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setStoring(false);
    }
  };
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-2 gap-4 p-6">
        <label className="flex flex-col">
          <span className="font-semibold">{t("Presentation_len")}</span>
          <input
            type="number"
            value={schedule.presentation_length}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                presentationLength: Number(e.target.value),
              }))
            }
            className="input input-bordered"
            min={1}
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">{t("gap_between")}</span>
          <input
            type="number"
            value={schedule.gap_between}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                gapBetween: Number(e.target.value),
              }))
            }
            className="input input-bordered"
            min={0}
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">{t("start_time")}</span>
          <input
            type="time"
            value={schedule.start_time || ""}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                startTime: e.target.value,
              }))
            }
            className="input input-bordered"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">{t("end_time")}</span>
          <input
            type="time"
            value={schedule.end_time || ""}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                endTime: e.target.value,
              }))
            }
            className="input input-bordered"
          />
        </label>

        {/* Lunch Break */}
        <label className="flex flex-col">
          <span className="font-semibold">{t("lunch_br_sta")}</span>
          <input
            type="time"
            value={schedule.lunch_start}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                lunchStart: e.target.value,
              }))
            }
            className="input input-bordered"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">{t("lunch_br_end")}</span>
          <input
            type="time"
            value={schedule.lunch_end}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                lunchEnd: e.target.value,
              }))
            }
            className="input input-bordered"
          />
        </label>

        {/* Dinner Break */}
        <label className="flex flex-col">
          <span className="font-semibold">{t("dinner_st_sta")}</span>
          <input
            type="time"
            value={schedule.dinner_start || ""}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                dinnerStart: e.target.value,
              }))
            }
            className="input input-bordered"
          />
        </label>

        <label className="flex flex-col">
          <span className="font-semibold">{t("dinner_st_end")}</span>
          <input
            type="time"
            value={schedule.dinner_end || ""}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                dinnerEnd: e.target.value,
              }))
            }
            className="input input-bordered"
          />
        </label>

        {/* Presentations Before Lunch */}
        <label className="flex flex-col col-span-2">
          <span className="font-semibold">{t("presentation_bf_lu")}</span>
          <input
            type="number"
            value={schedule.presentations_before_lunch || ""}
            onChange={(e) => {
              setSchedule((prev: Schedule) => ({
                ...prev,
                presentations_before_lunch: Math.min(
                  Number(e.target.value),
                  schedule.presentation_count
                ),
              }));
            }}
            className="input input-bordered"
            min={0}
            max={schedule.presentation_count}
          />
          <small className="text-gray-500">{t("no_pre_bf_lu")}</small>
        </label>

        {/* Presentations After Lunch */}
        <label className="flex flex-col col-span-2">
          <span className="font-semibold">{t("presentation_af_lu")}</span>
          <input
            type="number"
            value={schedule.presentations_after_lunch || ""}
            onChange={(e) =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                presentations_after_lunch: Math.min(
                  Number(e.target.value),
                  schedule.presentation_count
                ),
              }))
            }
            className="input input-bordered"
            min={0}
            max={schedule.presentation_count}
          />
          <small className="text-gray-500">{t("no_pre_af_lu")}</small>
        </label>

        <label className="flex items-center space-x-2 col-span-2">
          <input
            type="checkbox"
            checked={schedule.is_hour_24}
            onChange={() =>
              setSchedule((prev: Schedule) => ({
                ...prev,
                timeFormat24h: !prev.is_hour_24,
              }))
            }
            className="checkbox"
          />
          <span>{t("use_24")}</span>
        </label>
      </div>

      {!schedule.passed && (
        <PrimaryButton
          disabled={loading}
          onClick={prepareSchedule}
          className={`mx-auto items-center border shadow-none hover:shadow-none`}
        >
          <ButtonSpinner loading={loading}>{t("build_schedule")}</ButtonSpinner>
        </PrimaryButton>
      )}
      <Separator className="mt-6" />

      <ScheduleTable
        scheduleItems={schedule.scheduleItems}
        projects={schedule.projects}
        formatTime={formatTime}
        onAssign={assignPersonToSlot}
      />
      {schedule.scheduleItems.length > 0 && !schedule.passed && (
        <PrimaryButton onClick={store} className={`shadow-lg mx-auto mt-16`}>
          <ButtonSpinner loading={storing}>
            {t(add ? "save" : "update")}
          </ButtonSpinner>
          <Save className="size-[22px]" />
        </PrimaryButton>
      )}
    </div>
  );
};

export default EditScheduleTab;
