import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CheckListChooser from "@/components/custom-ui/chooser/CheckListChooser";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import CustomTextarea from "@/components/custom-ui/textarea/CustomTextarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskTypeEnum } from "@/database/model-enums";
import type { CheckList } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import { validateFile } from "@/lib/utils";
import type { ValidateItem } from "@/validation/types";
import { setServerError, validate } from "@/validation/validation";
import { BookOpenText } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { useParams } from "react-router";
import { toast } from "sonner";

interface UploadRegisterFormDailogprops {
  onComplete: () => void;
}
export default function UploadRegisterFormDailog(
  props: UploadRegisterFormDailogprops
) {
  const { onComplete } = props;
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<CheckList[] | undefined>(undefined);
  let { id } = useParams();

  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  const [error, setError] = useState(new Map<string, string>());
  const [userData, setUserData] = useState<{
    start_date: DateObject;
    request_comment: string;
    checklistMap: Map<string, any>;
  }>({
    start_date: new DateObject(),
    checklistMap: new Map(),
    request_comment: "",
  });

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(
        "organization/register/signed/form/checklist"
      );
      if (response.status == 200) {
        setList(response.data.checklist);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);
  const store = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const checklistValidationItem: ValidateItem[] = list!.map(
        (checklist: CheckList) => {
          const valid = (userData: any) => {
            if (userData?.checklistMap.get(checklist.id)) {
              return false;
            }
            return true;
          };
          return { name: checklist.name, rules: [valid] };
        }
      );
      const passed = await validate(
        [
          {
            name: "start_date",
            rules: ["required"],
          },
          ...checklistValidationItem,
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const content = {
        checklistMap: Array.from(userData.checklistMap),
        start_date: userData.start_date?.toDate()?.toISOString(),
        request_comment: userData.request_comment,
      };
      let formData = new FormData();
      if (id) formData.append("organization_id", id.toString());
      formData.append("content", JSON.stringify(content));
      const response = await axiosClient.post(
        "organization/store/signed/register/form",
        formData
      );
      if (response.status === 200) {
        toast.success(response.data.message);
        onComplete();
        modelOnRequestHide();
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full my-8 self-center [backdrop-filter:blur(20px)] bg-card">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {t("up_register_fo")}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-4">
        {list ? (
          <>
            {list.map((checklist: CheckList, index: number) => {
              return (
                <div className="mt-2" key={checklist.id}>
                  <CheckListChooser
                    donwloadUrl={`media/temporary`}
                    hasEdit={true}
                    number={`${index + 1}`}
                    url={`${
                      import.meta.env.VITE_API_BASE_URL
                    }/api/v1/checklist/file/upload`}
                    headers={{}}
                    accept={checklist.accept}
                    name={checklist.name}
                    defaultFile={userData.checklistMap.get(checklist.id)}
                    uploadParam={{
                      checklist_id: checklist.id,
                      organization_id: id,
                      task_type: TaskTypeEnum.organization_registeration,
                    }}
                    onComplete={async (record: any) => {
                      // 1. Update userData
                      for (const element of record) {
                        const item = element[element.length - 1];
                        const checklistMap: Map<string, any> =
                          userData.checklistMap;
                        checklistMap.set(checklist.id, item);
                        setUserData({
                          ...userData,
                          checklistMap: checklistMap,
                        });
                      }
                    }}
                    onFailed={async (failed: boolean, response: any) => {
                      if (failed) {
                        if (response) {
                          toast.error(response.data.message);
                          const checklistMap: Map<string, any> =
                            userData.checklistMap;
                          checklistMap.delete(checklist.id);
                          setUserData({
                            ...userData,
                            checklistMap: checklistMap,
                          });
                        }
                      }
                    }}
                    onStart={async (_file: File) => {}}
                    validateBeforeUpload={function (file: File): boolean {
                      const maxFileSize = checklist.file_size * 1024; // 2MB
                      const validTypes: string[] =
                        checklist.acceptable_mimes.split(",");
                      const resultFile = validateFile(
                        file,
                        Math.round(maxFileSize),
                        validTypes,
                        t
                      );
                      return resultFile ? true : false;
                    }}
                  />
                  {error.get(checklist.name) && (
                    <h1 className="rtl:text-md-rtl ltr:text-sm-ltr px-2 capitalize text-start text-red-400">
                      {error.get(checklist.name)}
                    </h1>
                  )}
                </div>
              );
            })}
            <CustomDatePicker
              placeholder={t("select_a_date")}
              lable={t("start_date")}
              requiredHint={`* ${t("required")}`}
              required={true}
              value={userData.start_date}
              dateOnComplete={(date: DateObject) => {
                setUserData({ ...userData, start_date: date });
              }}
              className="py-3 w-full mt-16"
              parentClassName="md:w-1/2 xl:w-1/3"
              errorMessage={error.get("start_date")}
            />
            <CustomTextarea
              label={t("request_comment")}
              rows={5}
              maxLength={300}
              placeholder={`${t("detail")}...`}
              defaultValue={userData.request_comment}
              onChange={(e: any) => {
                const { value } = e.target;
                setUserData({ ...userData, request_comment: value });
              }}
            />
            <div className="rtl:text-xl-rtl ltr:text-lg-ltr border rounded-lg py-1 px-2 w-fit bg-primary/5 items-center text-start flex gap-x-2">
              <BookOpenText className="size-[20px] text-primary/90" />
              {t("approval_des")}
            </div>
          </>
        ) : (
          <NastranSpinner />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          className="rtl:text-xl-rtl ltr:text-lg-ltr"
          variant="outline"
          onClick={modelOnRequestHide}
        >
          {t("cancel")}
        </Button>
        <PrimaryButton
          disabled={loading}
          onClick={store}
          className={`${loading && "opacity-90"}`}
          type="submit"
        >
          <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
        </PrimaryButton>
      </CardFooter>
    </Card>
  );
}
