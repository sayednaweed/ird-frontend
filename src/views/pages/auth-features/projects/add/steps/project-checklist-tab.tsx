import CheckListChooser from "@/components/custom-ui/chooser/CheckListChooser";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { CountryEnum, TaskTypeEnum } from "@/database/model-enums";
import type { CheckList } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import { validateFile } from "@/lib/utils";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { toast } from "sonner";

interface CheckListTabProps {
  type: "extend" | "register";
}

export default function ProjectCheckListTab(props: CheckListTabProps) {
  const { type } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const { userData, setUserData } = useContext(StepperContext);
  const [list, setList] = useState<CheckList[] | undefined>(undefined);
  const loadInformation = async () => {
    try {
      let url = "";
      let ex = {};
      if (type == "extend") {
        url =
          userData.prev_dire.country_id == CountryEnum.afghanistan
            ? "projects/extend/checklist"
            : "projects/extend/abroad/director-checklist";
        ex = {
          n_dir: userData.new_director,
          n_r: userData.new_represent,
        };
      } else {
        url = "checklists/project-registeration";
      }
      const response = await axiosClient.get(url, { params: ex });
      if (response.status == 200) {
        setList(response.data.checklist);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
      console.log(error);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);

  return (
    <div className="flex flex-col gap-y-6 pb-12">
      {list ? (
        list.map((checklist: CheckList, index: number) => {
          return (
            <CheckListChooser
              donwloadUrl={"media/temporary"}
              hasEdit={true}
              number={`${index + 1}`}
              key={checklist.id}
              url={`${
                import.meta.env.VITE_API_BASE_URL
              }/api/v1/checklist/file/upload`}
              headers={{}}
              accept={checklist.acceptable_mimes}
              name={checklist.name}
              defaultFile={userData?.checklistMap.get(checklist.id)}
              // validTypes={["image/png", "image/jpeg", "image/gif"]}
              uploadParam={{
                checklist_id: checklist.id,
                organization_id: id,
                task_type:
                  type == "register"
                    ? TaskTypeEnum.project_registeration
                    : TaskTypeEnum.project_extend,
              }}
              onComplete={async (record: any) => {
                // 1. Update userData
                for (const element of record) {
                  const item = element[element.length - 1];
                  const checklistMap: Map<string, any> = userData.checklistMap;
                  checklistMap.set(checklist.id, item);
                  setUserData((prev: any) => ({
                    ...prev,
                    checklistMap: checklistMap,
                  }));
                }
              }}
              onFailed={async (failed: boolean, response: any) => {
                if (failed) {
                  if (response) {
                    toast.error(response.data.message);
                    const checklistMap: Map<string, any> =
                      userData.checklistMap;
                    checklistMap.delete(checklist.id);

                    setUserData((prev: any) => ({
                      ...prev,
                      checklistMap: checklistMap,
                    }));
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
          );
        })
      ) : (
        <NastranSpinner />
      )}
    </div>
  );
}
