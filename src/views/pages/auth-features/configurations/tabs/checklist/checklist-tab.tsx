import NastranModel from "@/components/custom-ui/model/NastranModel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalState } from "@/context/GlobalStateContext";
import axiosClient from "@/lib/axois-client";
import { toLocaleDate } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import { Search } from "lucide-react";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import ChecklistDialog from "./checklist-dialog";
import type { CheckList, UserPermission } from "@/database/models";
import { toast } from "sonner";
import { ChecklistEnum, PermissionEnum } from "@/database/model-enums";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
interface ChecklistTabProps {
  permissions: UserPermission;
}
export default function ChecklistTab(props: ChecklistTabProps) {
  const { permissions } = props;
  const { t } = useTranslation();
  const [state] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{
    visible: boolean;
    checklist: any;
  }>({
    visible: false,
    checklist: undefined,
  });
  const [checklists, setChecklists] = useState<{
    unFilterList: CheckList[];
    filterList: CheckList[];
  }>({
    unFilterList: [],
    filterList: [],
  });
  const initialize = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // 2. Send data
      const response = await axiosClient.get(`checklists`);
      const fetch = response.data as CheckList[];
      setChecklists({
        unFilterList: fetch,
        filterList: fetch,
      });
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    initialize();
  }, []);

  const searchOnChange = (e: any) => {
    const { value } = e.target;
    // 1. Filter
    const filtered = checklists.unFilterList.filter((item: CheckList) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setChecklists({
      ...checklists,
      filterList: filtered,
    });
  };
  const add = (checklist: CheckList) => {
    setChecklists((prev) => ({
      unFilterList: [checklist, ...prev.unFilterList],
      filterList: [checklist, ...prev.filterList],
    }));
  };
  const update = (checklist: CheckList) => {
    setChecklists((prevState) => {
      const updatedUnFiltered = prevState.unFilterList.map((item) =>
        item.id === checklist.id ? checklist : item
      );

      return {
        ...prevState,
        unFilterList: updatedUnFiltered,
        filterList: updatedUnFiltered,
      };
    });
  };
  const remove = async (checklist: CheckList) => {
    try {
      // 1. Remove from backend
      const response = await axiosClient.delete(`checklists/${checklist.id}`);
      if (response.status === 200) {
        // 2. Remove from frontend
        setChecklists((prevChecklists) => ({
          unFilterList: prevChecklists.unFilterList.filter(
            (item) => item.id !== checklist.id
          ),
          filterList: prevChecklists.filterList.filter(
            (item) => item.id !== checklist.id
          ),
        }));
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
    }
  };

  const dailog = useMemo(
    () => (
      <NastranModel
        size="lg"
        visible={selected.visible}
        isDismissable={false}
        button={<button></button>}
        showDialog={async () => {
          setSelected({
            visible: false,
            checklist: undefined,
          });
          return true;
        }}
      >
        <ChecklistDialog checklist={selected.checklist} onComplete={update} />
      </NastranModel>
    ),
    [selected.visible]
  );
  const checklist = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_checklist
  );
  const hasEdit = checklist?.edit;
  const hasAdd = checklist?.add;
  const hasDelete = checklist?.delete;
  const hasView = checklist?.view;

  return (
    <div className="relative">
      <div className="rounded-md bg-card p-2 flex gap-x-4 items-baseline mt-4">
        {hasAdd && (
          <NastranModel
            size="lg"
            isDismissable={false}
            button={
              <PrimaryButton className="text-primary-foreground">
                {t("add_checklist")}
              </PrimaryButton>
            }
            showDialog={async () => true}
          >
            <ChecklistDialog onComplete={add} />
          </NastranModel>
        )}
        <CustomInput
          size_="lg"
          placeholder={`${t("search")}...`}
          parentClassName="flex-1"
          type="text"
          onChange={searchOnChange}
          startContent={
            <Search className="size-[18px] mx-auto rtl:mr-[4px] text-primary pointer-events-none" />
          }
        />
      </div>
      <Table className="bg-card rounded-md mt-1 py-8 w-full">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("id")}</TableHead>
            <TableHead className="text-start">{t("name")}</TableHead>
            <TableHead className="text-start">{t("type")}</TableHead>
            <TableHead className="text-start">{t("status")}</TableHead>
            <TableHead className="text-start">{t("saved_by")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {loading ? (
            <>
              <TableRow>
                <TableCell>
                  <Shimmer className="h-[24px] w-full rounded-sm" />
                </TableCell>
                <TableCell>
                  <Shimmer className="h-[24px] w-full rounded-sm" />
                </TableCell>
                <TableCell>
                  <Shimmer className="h-[24px] w-full rounded-sm" />
                </TableCell>
                <TableCell>
                  <Shimmer className="h-[24px] w-full rounded-sm" />
                </TableCell>
                <TableCell>
                  <Shimmer className="h-[24px] w-full rounded-sm" />
                </TableCell>
                <TableCell>
                  <Shimmer className="h-[24px] w-full rounded-sm" />
                </TableCell>
              </TableRow>
            </>
          ) : (
            checklists.filterList.map((checklist: CheckList, index: number) => (
              <TableRowIcon
                read={hasView}
                remove={hasDelete}
                edit={hasEdit}
                onEdit={async (checklist: CheckList) => {
                  setSelected({
                    visible: true,
                    checklist: checklist,
                  });
                }}
                key={index}
                item={checklist}
                onRemove={remove}
                onRead={async () => {}}
              >
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>{checklist.name}</TableCell>
                <TableCell className=" text-start">
                  <BooleanStatusButton
                    className=" mx-0"
                    getColor={function (): {
                      style: string;
                      value?: string;
                    } {
                      return ChecklistEnum.user === checklist.type_id
                        ? {
                            style: "border-green-500/90",
                            value: checklist.type,
                          }
                        : {
                            style: "border-red-500",
                            value: t("unknown"),
                          };
                    }}
                  />
                </TableCell>
                <TableCell>
                  <h1
                    className={
                      checklist.active == 1 ? " text-green-800" : "text-red-500"
                    }
                  >
                    {checklist.active == 1 ? t("active") : t("in_active")}
                  </h1>
                </TableCell>
                <TableCell className="max-w-[150px] text-[15px] truncate">
                  {checklist.saved_by}
                </TableCell>
                <TableCell>
                  {toLocaleDate(new Date(checklist.created_at), state)}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      {dailog}
    </div>
  );
}
