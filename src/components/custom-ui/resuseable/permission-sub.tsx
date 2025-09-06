import { memo } from "react";
import { useTranslation } from "react-i18next";
import CustomCheckbox from "../checkbox/CustomCheckbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import PrimaryButton from "../button/PrimaryButton";
import { ChevronsUpDown } from "lucide-react";
import type { IUserPermission } from "@/lib/types";

export interface PermissionSubProps {
  permission: IUserPermission;
  mainActions: {
    view: (value: boolean, permissionId: number) => void;
    add: (value: boolean, permissionId: number) => void;
    edit: (value: boolean, permissionId: number) => void;
    delete: (value: boolean, permissionId: number) => void;
    singleRow: (value: boolean, permissionId: number) => void;
  };
  subActions: {
    view: (value: boolean, permissionId: number, subId: number) => void;
    add: (value: boolean, permissionId: number, subId: number) => void;
    edit: (value: boolean, permissionId: number, subId: number) => void;
    delete: (value: boolean, permissionId: number, subId: number) => void;
    singleRow: (value: boolean, permissionId: number, subId: number) => void;
  };
}
const PermissionSub = (props: PermissionSubProps) => {
  const { permission, subActions, mainActions } = props;
  const { t } = useTranslation();
  return (
    <Collapsible>
      <CollapsibleTrigger asChild>
        <PrimaryButton className="w-full mb-2 py-[18px] flex justify-between hover:bg-primary/5 hover:shadow-none hover:text-primary bg-transparent shadow-none border text-primary">
          {t(permission.permission)}
          <ChevronsUpDown className="h-4 w-4" />
          <span className="sr-only">Toggle</span>
        </PrimaryButton>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-3 lg:px-4 py-4 md:py-4 bg-primary/5 pb-4 mb-4 border hover:shadow transition-shadow ease-in-out rounded-xl shadow-sm">
        <div className="md:flex md:flex-wrap xl:grid md:space-y-2 xl:space-y-0 space-y-3 xl:grid-cols-6 mt-2 items-center border-b pb-3">
          <div className="col-span-2 w-full xl:w-fit flex items-center">
            <CustomCheckbox
              checked={
                permission.view &&
                permission.add &&
                permission.delete &&
                permission.edit
              }
              onCheckedChange={(value: boolean) =>
                mainActions["singleRow"](value, permission.id)
              }
            />
            <h1 className="rtl:text-2xl-rtl ltr:text-xl-ltr text-start font-bold text-tertiary">
              {t(permission.permission)}
            </h1>
          </div>
          <CustomCheckbox
            text={t("add")}
            readOnly={!permission.view}
            className="ml-1"
            checked={permission.add}
            onCheckedChange={(value: boolean) =>
              mainActions["add"](value, permission.id)
            }
          />
          <CustomCheckbox
            readOnly={!permission.view}
            text={t("edit")}
            className="ml-1"
            checked={permission.edit}
            onCheckedChange={(value: boolean) =>
              mainActions["edit"](value, permission.id)
            }
          />
          <CustomCheckbox
            text={t("delete")}
            readOnly={!permission.view}
            className="ml-1"
            checked={permission.delete}
            onCheckedChange={(value: boolean) =>
              mainActions["delete"](value, permission.id)
            }
          />
          <CustomCheckbox
            text={t("view")}
            className="ml-1"
            checked={permission.view}
            onCheckedChange={(value: boolean) =>
              mainActions["view"](value, permission.id)
            }
          />
        </div>
        {permission.sub.map((subPermission, index: number) => (
          <div
            key={index}
            className={`md:flex select-none md:flex-wrap xl:grid md:space-y-2 xl:space-y-0 space-y-3 xl:grid-cols-6 mt-2 items-center border-b pb-3 ${
              !permission.view && "pointer-events-none opacity-60"
            }`}
          >
            <div className="col-span-2 w-full xl:w-fit flex items-center">
              <CustomCheckbox
                checked={
                  subPermission.view &&
                  subPermission.add &&
                  subPermission.delete &&
                  subPermission.edit
                    ? true
                    : false
                }
                onCheckedChange={(value: boolean) =>
                  subActions["singleRow"](
                    value,
                    permission.id,
                    subPermission.id
                  )
                }
              />
              <h1 className="rtl:text-2xl-rtl ltr:text-xl-ltr text-start rtl:font-bold text-tertiary">
                {t(subPermission.name)}
              </h1>
            </div>
            <CustomCheckbox
              text={t("add")}
              className="ml-1"
              readOnly={!subPermission.view}
              checked={subPermission.add}
              onCheckedChange={(value: boolean) =>
                subActions["add"](value, permission.id, subPermission.id)
              }
            />
            <CustomCheckbox
              text={t("edit")}
              className="ml-1"
              readOnly={!subPermission.view}
              checked={subPermission.edit}
              onCheckedChange={(value: boolean) =>
                subActions["edit"](value, permission.id, subPermission.id)
              }
            />
            <CustomCheckbox
              text={t("delete")}
              className="ml-1"
              readOnly={!subPermission.view}
              checked={subPermission.delete}
              onCheckedChange={(value: boolean) =>
                subActions["delete"](value, permission.id, subPermission.id)
              }
            />
            <CustomCheckbox
              text={t("view")}
              className="ml-1"
              checked={subPermission.view}
              onCheckedChange={(value: boolean) =>
                subActions["view"](value, permission.id, subPermission.id)
              }
            />
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default memo(PermissionSub);
