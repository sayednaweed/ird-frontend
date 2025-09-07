import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CheckListChooser from "@/components/custom-ui/chooser/CheckListChooser";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TaskTypeEnum } from "@/database/model-enums";
import type { Schedule } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import type { FileType } from "@/lib/types";
import { generateUUID, validateFile } from "@/lib/utils";
import { validate } from "@/validation/validation";
import { ChevronsDown, RefreshCcw, SquarePen } from "lucide-react";
import { type Dispatch, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export interface CustomProjectSelectProps {
  schedule: Schedule;
  setSchedule: Dispatch<any>;
  add: boolean;
}

export function UrgentProject(props: CustomProjectSelectProps) {
  const { schedule, setSchedule } = props;
  const { t } = useTranslation();
  const [error, setError] = useState<Map<string, string>>(new Map());

  const [failed, setFailed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [userData, setUserData] = useState<any>({});
  const fetch = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`checklists/deputy-doc`);
      if (response.status === 200) {
        setSchedule((prev: any) => ({
          ...prev,
          validation_checklist: response.data,
        }));
      }
    } catch (error: any) {
      console.log(error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!schedule?.validation_checklist) fetch();
  }, []);
  const handleChange = (selection: any) => {
    setUserData((prev: any) => ({
      ...prev,
      project: selection,
    }));
  };
  const addItem = async () => {
    const passed = await validate(
      [
        {
          name: "document",
          rules: ["required"],
        },
        {
          name: "presentation_count",
          rules: [
            (userData: Schedule) => {
              if (
                userData.special_projects &&
                userData.special_projects.length > userData.presentation_count
              ) {
                toast.error(t("presentation_count_exceed"));
                return true;
              }
              return false;
            },
          ],
        },
      ],
      userData,
      setError
    );
    if (!passed) {
      setLoading(false);
      return;
    }
    const newProject = {
      project: userData?.project,
      attachment: userData.document,
    };
    if (!schedule.special_projects) {
      // No special project added yet
      setSchedule((prev: Schedule) => ({
        ...prev,
        special_projects: [newProject],
        scheduleItems: [],
        projects: [],
      }));
    } else {
      if (schedule.special_projects.length > schedule.presentation_count) {
        toast.error(t("presentation_count_exceed"));
        return;
      }
      for (const item of schedule.special_projects) {
        if (item.project.id == userData?.project?.id) {
          toast.error(t("item_exist"));
          return;
        }
      }
      setSchedule((prev: Schedule) => ({
        ...prev,
        special_projects: [newProject, ...prev.special_projects],
        scheduleItems: [],
        projects: [],
      }));
    }
    setUserData({});
  };

  const onEditClicked = (item: {
    project: {
      id: number;
      name: string;
    };
    attachment: FileType;
  }) => {
    const deepCopy = JSON.parse(JSON.stringify(item));
    setUserData((prev: any) => ({
      ...prev,
      project: deepCopy.project,
      document: deepCopy.attachment,
    }));
    schedule.special_projects;
    setSchedule((prev: any) => {
      const updateSpecialProjects = prev.special_projects.filter(
        (sub: any) => sub.project.id != item.project.id
      );

      return { ...prev, special_projects: updateSpecialProjects };
    });
  };

  return (
    <div className="flex flex-col gap-x-4 gap-y-6 w-full">
      {failed ? (
        <PrimaryButton
          onClick={fetch}
          className="bg-red-500 hover:bg-red-500/70"
        >
          {t("failed")}
          <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
        </PrimaryButton>
      ) : loading ? (
        <NastranSpinner />
      ) : (
        <>
          <APICombobox
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={handleChange}
            lable={t("project")}
            className="sm:w-1/2 xl:w-1/3 2xl:h-1/4"
            selectedItem={userData?.project?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("project")}
            apiUrl={"projects/with/name"}
            mode="single"
            cacheData={false}
          />
          <div className="mt-2">
            <CheckListChooser
              donwloadUrl={`media/temporary`}
              key={userData?.document}
              number={undefined}
              hasEdit={true}
              url={`${
                import.meta.env.VITE_API_BASE_URL
              }/api/v1/files/single/upload`}
              headers={{}}
              name={t("document")}
              defaultFile={userData.document as FileType}
              uploadParam={{
                checklist_id: schedule?.validation_checklist?.id,
                task_type: TaskTypeEnum.scheduling,
                identifier: generateUUID(),
              }}
              accept={userData.acceptable_extensions}
              onComplete={async (record: any) => {
                for (const element of record) {
                  const checklist = element[element.length - 1];
                  setUserData((prev: any) => ({
                    ...prev,
                    document: checklist,
                  }));
                }
              }}
              onFailed={async (failed: boolean, response: any) => {
                if (failed) {
                  if (response) {
                    toast.error(response.data.message);
                    setUserData((prev: any) => ({
                      ...prev,
                      document: undefined,
                    }));
                  }
                }
              }}
              onStart={async (_file: File) => {}}
              validateBeforeUpload={function (file: File): boolean {
                const maxFileSize =
                  schedule.validation_checklist.file_size * 1024; // 2MB
                const validTypes: string[] =
                  schedule.validation_checklist.acceptable_mimes.split(",");
                const resultFile = validateFile(
                  file,
                  Math.round(maxFileSize),
                  validTypes,
                  t
                );
                return resultFile ? true : false;
              }}
            />
            {error.get("document") && (
              <h1 className="rtl:text-md-rtl ltr:text-sm-ltr px-2 capitalize text-start text-red-400">
                {error.get("document")}
              </h1>
            )}
          </div>
          <PrimaryButton
            onClick={addItem}
            className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr mx-auto col-span-full mt-8"
          >
            {t("add_to_list")}
            <ChevronsDown className="text-tertiary size-[18px] animate-bounce transition mx-auto cursor-pointer" />
          </PrimaryButton>
          <Table className="bg-card rounded-md w-full">
            <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr bg-primary/5">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="text-start">#</TableHead>
                <TableHead className="text-start">
                  {t("project_name")}
                </TableHead>
                <TableHead className="text-start">{t("action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
              {schedule.special_projects &&
                schedule.special_projects.map((item, index: number) => (
                  <TableRow key={item.project?.id}>
                    <TableCell className="text-start truncate">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-start truncate">
                      {item.project?.name}
                    </TableCell>
                    <TableCell className="text-start truncate">
                      <SquarePen
                        onClick={() => onEditClicked(item)}
                        className=" text-green-400 size-[20px] cursor-pointer"
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
