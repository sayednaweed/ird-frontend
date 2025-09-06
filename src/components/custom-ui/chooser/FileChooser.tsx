import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";
import { Label } from "@/components/ui/label";
import { cn, validateFile } from "@/lib/utils";
import { ArrowDownToLine, Paperclip, Trash2 } from "lucide-react";
import React, { type ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
export interface FileType {
  path: string;
  name: string;
}
export interface FileChooserProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  requiredHint?: string;
  lable: string;
  parentClassName?: string;
  errorMessage?: string;
  defaultFile: File | FileType;
  maxSize: number;
  validTypes: string[];
  disabled?: boolean;
  downloadParam?: { path: string; fileName: string };
  onchange: (file: File | undefined) => void;
}
const FileChooser = React.forwardRef<HTMLInputElement, FileChooserProps>(
  (props, ref: any) => {
    const {
      className,
      requiredHint,
      errorMessage,
      required,
      lable,
      defaultFile,
      maxSize,
      validTypes,
      disabled,
      downloadParam,
      parentClassName,
      onchange,
      ...rest
    } = props;
    const { t } = useTranslation();
    const [userData, setUserData] = useState<File | FileType | undefined>(
      defaultFile
    );
    const start = useDownloadStore((s) => s.startDownload);

    const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
      const maxFileSize = 2 * 1024 * 1024; // 2MB
      const validTypes: string[] = ["image/jpeg", "image/png", "image/jpg"];
      const fileInput = e.target;
      if (!fileInput.files || fileInput.files.length === 0) {
        return;
      }

      const checkFile = fileInput.files[0] as File;
      const file = validateFile(
        checkFile,
        Math.round(maxFileSize),
        validTypes,
        t
      );
      if (file) {
        setUserData(file);
        onchange(file);
        /** Reset file input */
        resetFile(e);
      }
    };
    const deleteFile = async () => {
      setUserData(undefined);
      onchange(undefined);
    };
    const resetFile = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.currentTarget) {
        e.currentTarget.type = "text";
        e.currentTarget.type = "file"; // Reset to file type
      }
    };

    const downloadable = userData && !(userData instanceof File);
    return (
      <div
        className={cn(
          `flex sm:grid sm:grid-cols-[auto_1fr] relative ${
            errorMessage && "mb-2"
          }`,
          parentClassName
        )}
      >
        <Label
          htmlFor="initail_scan"
          className={`w-fit rounded-s-md py-2 shadow-md bg-primary px-4 hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-x-3 text-primary-foreground`}
        >
          <h1 className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr pb-[1px] cursor-pointer">
            {lable}
          </h1>
          <input
            disabled={disabled}
            onChange={onFileChange}
            {...rest}
            ref={ref}
            type="file"
            id="initail_scan"
            className={cn("hidden cursor-pointer", className)}
          />
          <Paperclip className="min-h-[18px] min-w-[18px] size-[18px] cursor-pointer" />
        </Label>
        <label
          htmlFor={downloadable ? "" : "initail_scan"}
          className={`bg-card dark:!bg-black/30 flex items-center justify-between px-3 border rounded-e-md flex-1 rtl:text-lg-rtl ltr:text-md-ltr ${
            errorMessage && "border-red-400"
          }`}
        >
          {userData ? (
            <>
              {downloadable ? (
                <>
                  {userData.name}
                  <ArrowDownToLine
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the label's onClick from firing

                      start({
                        id: crypto.randomUUID(),
                        filename: defaultFile.name,
                        url: "media/public",
                        params: { path: userData.path },
                      });
                    }}
                    className="inline-block cursor-pointer min-h-[18px] min-w-[18px] size-[18px] text-primary/90 ltr:ml-2 rtl:mr-2"
                  />
                </>
              ) : (
                <>
                  <h1 className="rtl:pt-1"> {userData?.name}</h1>
                  <Trash2
                    onClick={deleteFile}
                    className="inline-block cursor-pointer text-red-500 min-h-[18px] min-w-[18px] size-[18px] ltr:ml-2 rtl:mr-2"
                  />
                </>
              )}
            </>
          ) : (
            t("select")
          )}
        </label>
        {required && (
          <span className="text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-[10px] rtl:left-[10px] -top-[17px] absolute font-semibold">
            {requiredHint}
          </span>
        )}
        {errorMessage && (
          <h1 className="rtl:text-md-rtl ltr:text-sm-ltr absolute -bottom-[24px] capitalize text-start text-red-400">
            {errorMessage}
          </h1>
        )}
      </div>
    );
  }
);

export default FileChooser;
