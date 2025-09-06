import { memo, useEffect, useRef, useState } from "react";
import { useDownloadStore } from "./download-store";
import { ChevronDown, CloudDownload, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTransition, animated } from "@react-spring/web";

const GlobalDownloader = () => {
  const { t } = useTranslation();

  const downloads = useDownloadStore((s) => s.downloads);
  const pause = useDownloadStore((s) => s.pauseDownload);
  const resume = useDownloadStore((s) => s.resumeDownload);
  const cancel = useDownloadStore((s) => s.cancelDownload);
  const clearCompleted = useDownloadStore((s) => s.clearCompleted);
  const clearAll = useDownloadStore((s) => s.clearAll);
  const [showDownloads, setShowDownloads] = useState(false);
  const prevDownloadsLength = useRef(downloads.length);
  useEffect(() => {
    if (downloads.length > prevDownloadsLength.current) {
      // New download added
      if (!showDownloads) setShowDownloads(true);
    }
    prevDownloadsLength.current = downloads.length;
  }, [downloads.length]);
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };
  const transitions = useTransition(showDownloads, {
    from: { opacity: 0, transform: "translateY(20px)" },
    enter: { opacity: 1, transform: "translateY(0)" },
    leave: { opacity: 0, transform: "translateY(20px)" },
    config: { tension: 250, friction: 24 },
  });
  return (
    <div className="fixed ltr:right-6 bottom-6 rtl:left-6 z-[60]">
      <CloudDownload
        onClick={() => setShowDownloads(!showDownloads)}
        className="text-white cursor-pointer size-10 p-2 bg-fourth border border-primary/20 hover:bg-fourth/90 transition-colors rounded-full"
      />

      {transitions(
        (style, item) =>
          item && (
            <animated.div
              style={style}
              className="fixed ltr:right-3 rtl:left-3 bottom-18 max-h-[50vh] sm:max-w-[320px] w-[90vw] sm:w-[320px] select-none overflow-y-auto p-4 bg-card border rounded-sm"
            >
              <div className="mb-8 flex flex-col xxl:flex-row gap-2">
                <div
                  onClick={clearCompleted}
                  className="flex gap-x-1 w-fit items-center border rounded hover:opacity-90 px-1 cursor-pointer ltr:text-xl-ltr rtl:text-lg-rtl rtl:font-semibold"
                >
                  <Trash2 className="size-4 text-red-400" />
                  {t("clear_complet")}
                </div>
                <div
                  onClick={clearAll}
                  className="flex gap-x-1 w-fit items-center border rounded hover:opacity-90 px-1 cursor-pointer ltr:text-xl-ltr rtl:text-lg-rtl rtl:font-semibold"
                >
                  <Trash2 className="size-4 text-red-400" />
                  {t("clear_all")}
                </div>
                <ChevronDown
                  onClick={() => setShowDownloads(false)}
                  className="bg-primary/10 cursor-pointer hover:bg-primary/15 transition-colors duration-150 size-5 rounded"
                />
              </div>

              {downloads.length === 0 && (
                <h1 className="ltr:text-lg-ltr rtl:text-lg-rtl">
                  {t("no_downloads")}
                </h1>
              )}

              {downloads.map((d) => (
                <div key={d.id} className="border-b mb-[10px] pb-2">
                  <div className="flex gap-x-2 line-clamp-2">
                    <strong className="text-md-ltr">{d.filename}</strong>
                    <span className="text-xl-ltr">{d.progress}%</span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: "#eee",
                      margin: "4px 0",
                      borderRadius: 3,
                    }}
                  >
                    <div
                      style={{
                        width: `${d.progress}%`,
                        height: "100%",
                        transition: "width 0.3s",
                        borderRadius: 3,
                      }}
                      className="bg-green-500/90"
                    />
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {formatBytes(d.received)} /{" "}
                    {d.total ? formatBytes(d.total) : "?"}
                  </div>
                  <div style={{ fontSize: 12, color: "#666" }}>{d.status}</div>
                  <div style={{ marginTop: 4 }}>
                    {d.status === "in-progress" && (
                      <>
                        <button onClick={() => pause(d.id)}>
                          {t("pause")}
                        </button>
                        <button
                          onClick={() => cancel(d.id)}
                          style={{ marginLeft: 8 }}
                        >
                          {t("cancel")}
                        </button>
                      </>
                    )}
                    {d.status === "paused" && (
                      <>
                        <button
                          className="ltr:text-xl-ltr font-semibold cursor-pointer"
                          onClick={() => resume(d.id)}
                        >
                          {t("resume")}
                        </button>
                        <button
                          className="ltr:ml-3 rtl:mr-3 ltr:text-xl-ltr font-semibold text-red-500 cursor-pointer"
                          onClick={() => cancel(d.id)}
                        >
                          {t("cancel")}
                        </button>
                      </>
                    )}
                    {d.status === "queued" && (
                      <button onClick={() => cancel(d.id)}>
                        {t("cancel")}
                      </button>
                    )}
                    {(d.status === "failed" || d.status === "cancelled") && (
                      <button onClick={() => cancel(d.id)}>
                        {t("remove")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </animated.div>
          )
      )}
    </div>
  );
};

export default memo(GlobalDownloader);
