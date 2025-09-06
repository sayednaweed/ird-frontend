import IconButton from "@/components/custom-ui/button/icon-button";
import axiosClient from "@/lib/axois-client";
import type { FileType } from "@/lib/types";
import axios from "axios";
import { CloudDownload } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface DownloaderProps {
  downloadText: string;
  filetoDownload: FileType;
  cancelText: string;
  apiUrl: string;
  params?: any;
  lockUpload?: (lock: boolean) => void;
}
const Downloader = (props: DownloaderProps) => {
  const {
    downloadText,
    filetoDownload,
    cancelText,
    lockUpload,
    apiUrl,
    params,
  } = props;
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cancelTokenSource, setCancelTokenSource] = useState<any>(null); // New state to store the cancel token

  const download = async () => {
    // 1. Create token
    const source = axios.CancelToken.source();
    setCancelTokenSource(source); // Store the source
    try {
      if (lockUpload) lockUpload(true);
      setIsDownloading(true);
      const response = await axiosClient.get(apiUrl, {
        params: {
          path: filetoDownload?.path,
          ...params,
        },
        responseType: "blob", // Important to handle the binary data (PDF)
        cancelToken: source.token, // Pass the cancel token here
        onDownloadProgress: (progressEvent) => {
          // Calculate download progress percentage
          const total = progressEvent.total || 0;
          const current = progressEvent.loaded;
          const progress = Math.round((current / total) * 100);
          setDownloadProgress(progress); // Update progress state
        },
      });
      if (response.status == 200) {
        // Create a URL for the file blob
        const file = new Blob([response.data], {
          type: filetoDownload.extension,
        });
        // const file = new Blob([response.data], { type: "application/pdf" });
        const fileURL = window.URL.createObjectURL(file);

        const link = document.createElement("a");
        link.href = fileURL;
        link.download = filetoDownload.name;
        link.click();

        // Clean up the URL object after download
        window.URL.revokeObjectURL(fileURL);
      }
    } catch (error: any) {
      toast.error(error.response.data?.message);
      console.log(error);
    }
    setIsDownloading(false); // Reset downloading state
    if (lockUpload) lockUpload(false);
  };

  const cancelDownload = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel("Download canceled by user.");
      setIsDownloading(false); // Reset downloading state
    }
  };
  return (
    <div className="flex flex-col items-center">
      <label
        onClick={download}
        className="flex flex-col items-center justify-center h-full transition-opacity duration-150 cursor-pointer hover:opacity-80"
      >
        <CloudDownload className="size-[30px] bg-tertiary text-primary-foreground rounded-full p-[4px]" />
        <strong className="ltr:text-md-ltr rtl:text-[17px] font-medium text-primary-text">
          {downloadText}
        </strong>
      </label>
      {isDownloading && (
        <div>
          <div className="relative mx-[4px] mb-[6px] w-[50px] h-[50px]">
            {/* Background Circle */}
            <svg
              className="absolute transform rotate-90"
              width="50"
              height="50"
            >
              <circle
                cx="25"
                cy="25"
                r="22"
                stroke="rgba(200, 200, 200, 0.2)"
                strokeWidth="5"
                fill="none"
              />
            </svg>

            {/* Progress Circle */}
            <svg
              className="absolute transform rotate-90"
              width="50"
              height="50"
            >
              <circle
                cx="25"
                cy="25"
                r="22"
                stroke="#34D399" // Adjust to match your desired color (primary/tertiary)
                strokeWidth="5"
                fill="none"
                strokeDasharray="138.2" // Circumference of the smaller circle (2 * PI * radius)
                strokeDashoffset={138.2 - (138.2 * downloadProgress) / 100} // Dynamically adjust stroke dashoffset based on progress
              />
            </svg>

            {/* Text inside circle */}
            <div className="absolute text-primary text-[11px] font-semibold top-0 bottom-0 left-0 flex items-center justify-center w-full h-full">
              {downloadProgress}%
            </div>
          </div>

          <IconButton
            className="hover:bg-red-400/30 mx-auto py-[2px] px-2 rtl:text-lg-rtl ltr:text-md-ltr transition-all border-red-400/40 text-red-400"
            onClick={cancelDownload}
          >
            {cancelText}
          </IconButton>
        </div>
      )}
    </div>
  );
};

export default Downloader;
