import type { Project, ScheduleItem } from "@/database/models";
import type { FileType } from "@/lib/types";
import React from "react";
import { useTranslation } from "react-i18next";

interface Props {
  scheduleItems: ScheduleItem[];
  projects: Project[];
  formatTime: (time: string) => string;
  onAssign: (
    slotId: number,
    projectId: number | null,
    projectName: string | undefined,
    attachment: FileType | undefined,
    selected: boolean,
    action: "add" | "remove"
  ) => void;
}

const ScheduleTable: React.FC<Props> = ({
  scheduleItems,
  projects,
  formatTime,
  onAssign,
}) => {
  const getPersonById = (id: number | null) =>
    projects.find((p) => p.id === id) ?? null;
  const { t } = useTranslation();
  return (
    <div className="p-6 max-w-3xl space-y-6 mx-auto">
      {scheduleItems.map((item) => {
        const project = getPersonById(item.projectId);

        return (
          <div
            key={item.slot.id}
            className="flex justify-between items-center p-4 bg-gray-50 rounded shadow cursor-move"
          >
            <div>
              <p className="font-semibold">
                {formatTime(item.slot.presentation_start)} -{" "}
                {formatTime(item.slot.presentation_end)}
              </p>
              <p className="text-gray-700">
                {project ? project.name : "No presenter assigned"}
              </p>
            </div>
            <div className="flex gap-2">
              {!project?.selected && (
                <select
                  className="select select-bordered select-sm"
                  value={item.projectId ?? ""}
                  onChange={(e) => {
                    const selectedProject = getPersonById(
                      Number(e.target.value)
                    );

                    onAssign(
                      item.slot.id,
                      e.target.value ? Number(e.target.value) : null,
                      selectedProject?.name,
                      selectedProject?.attachment,
                      true,
                      "add"
                    );
                  }}
                >
                  <option value="">{t("unassigned")}</option>
                  {projects.map(
                    (p) =>
                      !p?.selected && (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      )
                  )}
                </select>
              )}
              {project && (
                <button
                  className="btn ltr:ml-4 rtl:mr-4 cursor-pointer btn-sm btn-outline"
                  onClick={() => {
                    const selectedProject = getPersonById(
                      Number(item.projectId)
                    );
                    onAssign(
                      item.slot.id,
                      item.projectId,
                      selectedProject?.name,
                      selectedProject?.attachment,
                      false,
                      "remove"
                    );
                  }}
                >
                  {t("remove")}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleTable;
