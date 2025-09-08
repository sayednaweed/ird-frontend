import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import type { Presentation } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  FileWarning,
  Folder,
} from "lucide-react";
import { useEffect, useState, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { toast } from "sonner";

// Icon map
const fileTypeIcons: Record<string, JSX.Element> = {
  pdf: <FileWarning className="w-5 h-5 text-red-500" />,
  doc: <FileText className="w-5 h-5 text-blue-500" />,
  default: <Folder className="w-5 h-5 text-gray-400" />,
};

const getFileIcon = (mimeType: string) => {
  if (mimeType.includes("pdf")) return fileTypeIcons.pdf;
  if (mimeType.includes("word") || mimeType.includes("doc"))
    return fileTypeIcons.doc;
  return fileTypeIcons.default;
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const colorMap: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    "in progress": "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    scheduled: "bg-indigo-100 text-indigo-800",
  };

  const match = Object.keys(colorMap).find((key) =>
    status.toLowerCase().includes(key)
  );

  return (
    <span
      className={`text-xs font-semibold px-3 py-1 rounded-full ${
        colorMap[match ?? ""] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

export const ScheduleView: React.FC = () => {
  const { id } = useParams();
  const [schedule, setSchedule] = useState<Presentation | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [loadingComplete, setLoadingComplete] = useState<
    Record<number, boolean>
  >({});
  const { t } = useTranslation();

  const toggleExpand = (id: number) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadInformation = async () => {
    try {
      const res = await axiosClient.get(`schedules/present/${id}`);
      setSchedule(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to load schedule");
    }
  };

  useEffect(() => {
    loadInformation();
  }, []);

  const markAsComplete = async (projectId: number) => {
    setLoadingComplete((prev) => ({ ...prev, [projectId]: true }));
    try {
      // Assuming your API endpoint to update status:
      await axiosClient.post(`schedules/mark-complete/${projectId}`);

      toast.success(t("marked_as_complete"));

      // Refresh schedule data
      await loadInformation();
    } catch (err: any) {
      toast.error(err.response?.data?.message || t("failed_to_mark_complete"));
    } finally {
      setLoadingComplete((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  if (!schedule) return <NastranSpinner />;

  return (
    <div className="w-full px-4 md:px-12 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary to-tertiary text-white p-8 rounded shadow-lg mb-12">
        <h1 className="text-4xl font-extrabold mb-4">
          {t("schedule")}: {schedule.date}
        </h1>
        <div className="grid md:grid-cols-2 gap-5 text-lg font-medium tracking-wide">
          <p>
            ⏰ <strong>{t("time")}:</strong> {schedule.start_time} –{" "}
            {schedule.end_time}
          </p>
          <p>
            🍽️ <strong>{t("lunch")}:</strong> {schedule.lunch_start} –{" "}
            {schedule.lunch_end}
          </p>
          <p>
            ⏳ <strong>{t("gap")}:</strong> {schedule.gap_between} mins
          </p>
          <p>
            📋 <strong>{t("status")}:</strong>{" "}
            <StatusBadge status={schedule.schedule_status} />
          </p>
        </div>
      </div>

      {/* Schedule Items */}
      <div className="space-y-8">
        {schedule.schedule_items.map((item) => (
          <div
            key={item.project_id}
            className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 transition-shadow duration-300 hover:shadow-xl"
          >
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {item.project_name}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {item.start_time} – {item.end_time}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <StatusBadge status={item.status} />
                <button
                  onClick={() => toggleExpand(item.project_id)}
                  className="flex items-center text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer select-none"
                  aria-expanded={expanded[item.project_id] ? "true" : "false"}
                >
                  {expanded[item.project_id] ? (
                    <>
                      <ChevronUp className="w-5 h-5 mr-1" /> {t("hide_doc")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-5 h-5 mr-1" /> {t("show_doc")}
                    </>
                  )}
                </button>

                {/* Show Complete button only if status is NOT completed */}
                {item.status.toLowerCase() !== "completed" && (
                  <button
                    onClick={() => markAsComplete(item.project_id)}
                    disabled={loadingComplete[item.project_id]}
                    className={`ml-4 px-4 py-2 rounded-full text-white font-semibold transition ${
                      loadingComplete[item.project_id]
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {loadingComplete[item.project_id]
                      ? t("marking...")
                      : t("mark_as_complete")}
                  </button>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div
              className={`mt-6 overflow-hidden transition-all duration-300 ${
                expanded[item.project_id] ? "max-h-[1000px]" : "max-h-0"
              }`}
            >
              {expanded[item.project_id] && (
                <>
                  {item.documents.length === 0 ? (
                    <p className="text-sm italic text-gray-400">
                      {t("no_availble_doc")}
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {item.documents.map((doc, idx) => {
                        const sizeKB = (Number(doc.size) / 1024).toFixed(1);
                        const fileUrl = `${doc.path}`;
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              {getFileIcon(doc.type)}
                              <div>
                                <p className="font-medium text-gray-800">
                                  {doc.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {doc.checklist}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-xs text-gray-500">
                                {sizeKB} KB
                              </span>
                              <a
                                href={fileUrl}
                                download
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-indigo-600"
                                aria-label={`Download ${doc.name}`}
                              >
                                <Download className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
