import {
  useAbortAll,
  useBatchFinalizeListener,
  useItemProgressListener,
  useItemStartListener,
  useUploadyContext,
} from "@rpldy/uploady";
import { useRef } from "react";
import { refreshAccessToken } from "@/lib/axois-client";
import IconButton from "@/components/custom-ui/button/icon-button";
export interface ISimpleProgressBarProps {
  onFailed: (failed: boolean, response: any) => Promise<void>;
  onComplete: (response: any) => Promise<void>;
  onStart: (file: File) => Promise<void>;
  cancelText: string;
  failedText: string;
  validateBeforeUpload: (file: File) => boolean;
}
const SimpleProgressBar = (props: ISimpleProgressBarProps) => {
  const {
    onComplete,
    onStart,
    onFailed,
    cancelText,
    failedText,
    validateBeforeUpload,
  } = props;
  // const [progress, setProgress] = useState(0);
  const failedDiv = useRef<HTMLDivElement | null>(null);
  const progressDiv = useRef<HTMLDivElement | null>(null);
  const cancelDiv = useRef<HTMLButtonElement | null>(null);
  const mainDiv = useRef<HTMLDivElement | null>(null);
  const circleRef = useRef<SVGCircleElement | null>(null);
  const abortAll = useAbortAll();
  const uploadyContext = useUploadyContext();

  const initProgress = (progress: number) => {
    mainDiv.current!.style.setProperty("display", "flex");
    cancelDiv.current!.style.setProperty("display", "block");
    failedDiv.current!.style.setProperty("display", "none");
    progressDiv.current!.style.setProperty("display", "flex");
    setProgress(progress);
  };
  const taskFailed = () => {
    failedDiv.current!.style.setProperty("display", "flex");
    progressDiv.current!.style.setProperty("display", "none");
  };
  const completed = () => {
    cancelDiv.current!.style.setProperty("display", "none");
  };
  const setProgress = (progress: number) => {
    progressDiv.current!.innerHTML = `${progress}%`;
    const circumference = 138.2; // Circumference of the circle (2 * PI * radius)
    const offset = circumference - (circumference * progress) / 100;
    circleRef.current!.style.strokeDashoffset = `${offset}`;
  };
  useItemStartListener((item) => {
    const file = item.file as File;

    // Validate before upload starts
    if (!validateBeforeUpload(file)) {
      abortAll();
      // If validation fails, trigger failure UI
      onFailed(true, undefined);
      taskFailed();
      return; // Stop the upload
    }
    onStart(file as File);
    initProgress(0);
  });
  useItemProgressListener((item) => {
    if (item.state != "error") {
      setProgress(Math.round(item.completed));
    }
  });
  useBatchFinalizeListener(async (batch) => {
    const failedFiles = batch.items.filter(
      (item) => item.state == "error" || item.state == "aborted"
    );
    if (failedFiles.length > 0) {
      for (const file of failedFiles) {
        const chunkUploadResponse = file.uploadResponse?.chunkUploadResponse;
        if (chunkUploadResponse?.status === 403) {
          console.warn("Token expired. Refreshing token...");
          retryUploadAfterTokenRefresh(file, uploadyContext);
        } else {
          onFailed(true, chunkUploadResponse.response);
          taskFailed();
        }
      }
    } else {
      const file = batch.items.map((item) => {
        return item.uploadResponse.results.map((data: any) => data.data);
      });
      completed();
      await onComplete(file);
    }
  });
  const cancel = () => {
    abortAll();
    setProgress(0);
  };
  const retryUploadAfterTokenRefresh = async (
    item: any,
    uploadyContext: any
  ) => {
    try {
      // Refresh the token
      const success = await refreshAccessToken();
      if (success) {
        uploadyContext.upload(item.file, uploadyContext.getOptions()); // Re-upload the file
      } else {
        throw new Error("Failed to refresh token");
      }
    } catch (error) {
      console.error("Upload failed after token refresh", error);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-y-1">
      <div
        ref={mainDiv}
        className="relative hidden mx-[4px] w-fit justify-center h-[50px]"
      >
        {/* Background Circle */}
        <svg className="absolute transform rotate-90" width="50" height="50">
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
        <svg className="absolute transform rotate-90" width="50" height="50">
          <circle
            ref={circleRef}
            cx="25"
            cy="25"
            r="22"
            stroke="#34D399" // Adjust to match your desired color (primary/tertiary)
            strokeWidth="5"
            fill="none"
            strokeDasharray="138.2" // Circumference of the smaller circle (2 * PI * radius)
          />
        </svg>

        {/* Text inside circle */}
        <div
          ref={failedDiv}
          className="text-red-400 hidden rtl:text-sm-rtl text-[12px] font-semibold items-center justify-center w-fit h-full"
        >
          {failedText}
        </div>
        <div
          ref={progressDiv}
          className="text-primary text-[12px] font-semibold flex items-center justify-center w-fit h-full"
        ></div>
      </div>
      <IconButton
        ref={cancelDiv}
        className="hover:bg-red-400/30 hidden mx-auto py-[2px] px-2 rtl:text-lg-rtl ltr:text-md-ltr transition-all border-red-400/40 text-red-400"
        onClick={cancel}
      >
        {cancelText}
      </IconButton>
    </div>
  );
};

export default SimpleProgressBar;
