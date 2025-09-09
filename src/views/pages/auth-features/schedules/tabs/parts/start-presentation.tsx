import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";
import ServerError from "@/components/custom-ui/resuseable/server-error";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import CustomTextarea from "@/components/custom-ui/textarea/CustomTextarea";
import { ScheduleStatusEnum, StatusEnum } from "@/database/model-enums";
import type { Presentation, PresentationItem } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import { animated, useSpring } from "@react-spring/web";
import {
  Check,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Image,
  PenLine,
} from "lucide-react";
import {
  useEffect,
  useState,
  type Dispatch,
  type JSX,
  type SetStateAction,
} from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

// Icon map
const fileTypeIcons: Record<string, JSX.Element> = {
  pdf: <FileText className="w-5 h-5 text-orange-400" />,
  doc: <FileText className="w-5 h-5 text-gray-400" />,
  default: <Image className="w-5 h-5 text-gray-400" />,
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
  const [storing, setStoring] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const handleSchedules = () =>
    navigate("/dashboard/schedules", { replace: true });
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

  if (!schedule) return <NastranSpinner />;

  const saveData = async () => {
    if (storing || id === undefined) {
      setStoring(false);
      return;
    }
    setStoring(true);
    // 2. Store
    try {
      const pendingErrors: Record<string, string[]> = {};
      let errorFound = false;

      schedule.schedule_items.forEach((item: PresentationItem) => {
        if (item.status.id == StatusEnum.pending) {
          pendingErrors[item.project_id] = [
            `${t("project")} ${item.project_name} ${t("is_pending")}`,
          ];
          errorFound = true;
        }
      });
      if (errorFound) {
        toast.error(<ServerError errors={pendingErrors} />);
        return;
      }
      const response = await axiosClient.post("schedules/submit", {
        id: id,
        schedule_items: schedule.schedule_items,
      });
      if (response.status == 200) {
        toast.success(response.data.message);
        navigate("/dashboard/schedules", { replace: true });
      }
    } catch (error: any) {
      toast.error(<ServerError errors={error.response.data.errors} />);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };
  return (
    <div className="w-full px-2 pt-2">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={handleSchedules}>
          {t("schedules")}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={() => navigate(-1)}>{id}</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem className=" text-primary">
          {t("start_resentation")}
        </BreadcrumbItem>
      </Breadcrumb>
      {/* Header */}
      <div className="bg-gradient-to-br mt-4 from-primary to-primary/85 dark:from-card dark:to-card dark:text-card-foreground text-primary-foreground p-8 rounded shadow-lg">
        <h1 className="text-2xl font-extrabold mb-4 flex items-baseline gap-x-3">
          {t("schedule")}:
          <span className="text-lg text-primary-foreground/80">
            {schedule.date}
          </span>
        </h1>
        <div className="flex justify-between">
          <div className="grid md:grid-cols-2 gap-5 text-xl-ltr font-medium tracking-wide">
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
          {schedule.schedule_status_id == ScheduleStatusEnum.Scheduled && (
            <PrimaryButton
              onClick={saveData}
              className={`items-center border bg-primary/5 hover:shadow-none shadow-none dark:text-card-foreground hover:bg-primary-foreground/10 ${
                storing && "pointer-events-none"
              }`}
            >
              <ButtonSpinner className=" gap-x-2" loading={storing}>
                {t("submit")}
                <ClipboardCheck className=" text-green-400" />
              </ButtonSpinner>
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Schedule Items */}
      <PresentationRow
        readonly={schedule.schedule_status_id != ScheduleStatusEnum.Scheduled}
        schedule={schedule}
        setSchedule={setSchedule}
      />
    </div>
  );
};

export interface PresentationRowProps {
  schedule: Presentation;
  setSchedule: Dispatch<SetStateAction<Presentation | null>>;
  readonly: boolean;
}
const PresentationRow = (props: PresentationRowProps) => {
  const { schedule, setSchedule, readonly } = props;
  const [expandedDocs, setExpandedDocs] = useState<boolean>(false);
  const [expandedDetail, setExpandedDetail] = useState<boolean>(false);
  const start = useDownloadStore((s) => s.startDownload);

  const { t } = useTranslation();
  const updateScheduleItemStatus = (
    projectId: number,
    column: string,
    newStatus: any
  ) => {
    setSchedule((prev) => {
      if (!prev) return prev; // Handle null just in case

      return {
        ...prev,
        schedule_items: prev.schedule_items.map((item) =>
          item.project_id === projectId
            ? { ...item, [column]: newStatus }
            : item
        ),
      };
    });
  };

  const onComplete = (scheduleItem: PresentationItem) => {
    if (scheduleItem.status?.id == StatusEnum.pending) {
      if (expandedDocs) {
        setExpandedDocs(false);
      }
      setExpandedDetail(true);
      toast.error(
        `${t("project")} ${scheduleItem.project_name} ${t("is_pending")}`
      );
    }
  };
  const docSpring = useSpring({
    config: { tension: 250, friction: 30 },
    height: expandedDocs ? "auto" : "0px",
    opacity: expandedDocs ? 1 : 0,
    overflow: "hidden",
  });

  const detailSpring = useSpring({
    config: { tension: 250, friction: 30 },
    height: expandedDetail ? "auto" : "0px",
    opacity: expandedDetail ? 1 : 0,
    overflow: "hidden",
  });
  return (
    <div className="space-y-8 mt-1 pb-16">
      {schedule.schedule_items.map((scheduleItem) => (
        <div
          key={scheduleItem.project_id}
          className=" bg-card border rounded px-6 pt-4"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 md:gap-0">
            <div>
              <h2 className="text-xl font-semibold text-primary">
                {scheduleItem.project_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {scheduleItem.start_time} – {scheduleItem.end_time}
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <button
                onClick={() => {
                  if (expandedDetail) {
                    setExpandedDetail(!expandedDetail);
                  }
                  setExpandedDocs(!expandedDocs);
                }}
                className="flex items-center text-secondary-foreground font-semibold cursor-pointer select-none"
                aria-expanded={expandedDocs ? "true" : "false"}
              >
                {expandedDocs ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-1" /> {t("hide_doc")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-1" /> {t("show_doc")}
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  if (expandedDocs) {
                    setExpandedDocs(false);
                  }
                  setExpandedDetail(!expandedDetail);
                }}
                className="flex items-center text-secondary-foreground font-semibold cursor-pointer select-none"
                aria-expanded={expandedDetail ? "true" : "false"}
              >
                {expandedDetail ? (
                  <>
                    <ChevronUp className="w-5 h-5 mr-1" /> {t("hid_pren_info")}
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5 mr-1" />{" "}
                    {t("sho_pren_info")}
                  </>
                )}
              </button>
              {/* Show Complete button only if status is NOT completed */}
              <PrimaryButton
                onClick={() => onComplete(scheduleItem)}
                className="items-center border bg-primary/5 hover:shadow-none shadow-none text-primary hover:text-primary hover:bg-primary/10"
              >
                {scheduleItem.status.id != StatusEnum.pending ? (
                  <>
                    <h1 className=" text-green-400">
                      {scheduleItem.status?.name}
                    </h1>
                    <Check className=" text-green-400" />
                  </>
                ) : (
                  <>
                    <h1>{scheduleItem.status?.name}</h1> <PenLine />
                  </>
                )}
              </PrimaryButton>
            </div>
          </div>
          {/* Documents Section */}
          <animated.div style={docSpring} className="mt-6 overflow-hidden">
            {expandedDocs && (
              <>
                {scheduleItem.documents.length === 0 ? (
                  <p className="text-sm italic text-gray-400">
                    {t("no_availble_doc")}
                  </p>
                ) : (
                  <div className="space-y-4">
                    {scheduleItem.documents.map((doc, idx) => {
                      const sizeKB = (Number(doc.size) / 1024).toFixed(1);
                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-secondary/60 border rounded-lg p-4 hover:bg-secondary transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            {getFileIcon(doc.type)}
                            <div>
                              <p className="font-medium text-secondary-foreground">
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
                            <div className="flex gap-x-3">
                              <Download
                                onClick={() =>
                                  start({
                                    id: crypto.randomUUID(),
                                    filename: doc.name,
                                    url: `media/private`,
                                    params: { path: doc.path },
                                  })
                                }
                                className="w-5 h-5"
                              />
                              <Eye
                                onClick={() =>
                                  start({
                                    id: crypto.randomUUID(),
                                    filename: doc.name,
                                    url: `media/private`,
                                    params: { path: doc.path },
                                    newTab: true,
                                  })
                                }
                                className="w-5 h-5"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </animated.div>
          <animated.div
            style={detailSpring}
            className="mt-6 py-6 flex flex-col gap-y-4 overflow-hidden"
          >
            {expandedDetail && (
              <>
                <APICombobox
                  placeholderText={t("search_item")}
                  errorText={t("no_item")}
                  onSelect={(selection: any) =>
                    updateScheduleItemStatus(
                      scheduleItem.project_id,
                      "status",
                      selection
                    )
                  }
                  lable={t("status")}
                  parentClassName="sm:w-1/2 xl:w-1/3"
                  required={true}
                  requiredHint={`* ${t("required")}`}
                  selectedItem={scheduleItem?.status.name}
                  placeHolder={t("select_a")}
                  apiUrl={"statuses/prensentation"}
                  mode="single"
                  readonly={readonly}
                />
                <CustomTextarea
                  required={true}
                  label={t("comment")}
                  parentClassName="col-span-full"
                  requiredHint={`* ${t("required")}`}
                  name="comment"
                  defaultValue={scheduleItem?.comment}
                  placeholder={t("detail")}
                  onChange={(e) => {
                    const { value, name } = e.target;
                    updateScheduleItemStatus(
                      scheduleItem.project_id,
                      name,
                      value
                    );
                  }}
                  rows={8}
                  readOnly={readonly}
                />
              </>
            )}
          </animated.div>
        </div>
      ))}
    </div>
  );
};
