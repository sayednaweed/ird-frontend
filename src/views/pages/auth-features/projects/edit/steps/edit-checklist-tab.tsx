import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axois-client";
import { useParams } from "react-router";

import { validateFile } from "@/lib/utils";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import type { AgreementDocument } from "@/database/models";
import { toast } from "sonner";
import CheckListChooser from "@/components/custom-ui/chooser/CheckListChooser";
import { TaskTypeEnum } from "@/database/model-enums";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";

export interface EditChecklistTabProps {
  hasEdit: boolean;
}
export default function EditChecklistTab(props: EditChecklistTabProps) {
  const { hasEdit } = props;
  const { t } = useTranslation();
  const { id } = useParams();
  const { user } = useGeneralAuthState();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [documents, setDocuments] = useState<AgreementDocument[]>([]);
  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`projects/checklists/${id}`);
      if (response.status == 200) {
        const agreement_documents = response.data;
        setDocuments(agreement_documents);
        if (failed) setFailed(false);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
      setFailed(true);
    }
    setLoading(false);
  };
  useEffect(() => {
    initialize();
  }, []);

  return (
    <Card className="h-fit">
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("checklist")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("edit_descr")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <NastranSpinner />
        ) : (
          documents.map((doc: AgreementDocument, index: number) => (
            <CheckListChooser
              donwloadUrl="media/private"
              hasEdit={hasEdit}
              number={`${index + 1}`}
              key={doc.checklist_id}
              url={`${
                import.meta.env.VITE_API_BASE_URL
              }/api/v1/single/checklist/file/upload/no-pending`}
              headers={{}}
              accept={doc.acceptable_mimes}
              name={doc.checklist_name}
              defaultFile={doc}
              // validTypes={["image/png", "image/jpeg", "image/gif"]}
              uploadParam={{
                document_id: doc.document_id,
                checklist_id: doc.checklist_id,
                organization_id: user.id,
                project_id: id,
                task_type: TaskTypeEnum.project_registeration,
              }}
              onComplete={async (record: any) => {
                // 1. Update userData
                for (const element of record) {
                  const item = element[element.length - 1];
                  const { file, message } = item;
                  setDocuments((prev) =>
                    prev.map((item) => {
                      return item.checklist_id == file?.checklist_id
                        ? {
                            ...item, // preserve all original fields
                            path: file.path,
                            document_id: file.document_id,
                            size: file.size,
                            type: file.type,
                            name: file.name,
                          }
                        : item;
                    })
                  );
                  toast.success(message);
                }
              }}
              onFailed={async (failed: boolean, response: any) => {
                if (failed) {
                  if (response) {
                    toast.error(response.data.message);
                  }
                }
              }}
              onStart={async (_file: File) => {}}
              validateBeforeUpload={function (file: File): boolean {
                const maxFileSize = doc.file_size * 1024; // 2MB
                const validTypes: string[] = doc.acceptable_mimes.split(",");
                const resultFile = validateFile(
                  file,
                  Math.round(maxFileSize),
                  validTypes,
                  t
                );
                return resultFile ? true : false;
              }}
            />
          ))
        )}
      </CardContent>

      {failed && (
        <CardFooter>
          <PrimaryButton
            disabled={loading}
            onClick={async () => await initialize()}
            className={`${loading && "opacity-90"} bg-red-500 hover:bg-red-500`}
            type="submit"
          >
            <ButtonSpinner loading={loading}>
              {t("failed")}
              <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
            </ButtonSpinner>
          </PrimaryButton>
        </CardFooter>
      )}
    </Card>
  );
}
