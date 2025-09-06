import axiosClient from "@/lib/axois-client";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import type { BasicModel, UserPermission } from "@/database/models";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import { toLocaleDate } from "@/lib/utils";
import { useGlobalState } from "@/context/GlobalStateContext";
import NewsTypeDialog from "@/views/pages/auth-features/about/tabs/news-type/news-type-dialog";

interface NewsTypeTabProps {
  permissions: UserPermission;
}
export default function NewsTypeTab(props: NewsTypeTabProps) {
  const { permissions } = props;
  const { t } = useTranslation();
  const [state] = useGlobalState();

  const [loading, setLoading] = useState(false);
  const [onEdit, setOnEdit] = useState<BasicModel | undefined>(undefined);
  const [newsTypes, setNewsTypes] = useState<{
    unFilterList: BasicModel[];
    filterList: BasicModel[];
  }>({
    unFilterList: [],
    filterList: [],
  });
  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/news-types");
      if (response.status == 200) {
        setNewsTypes({
          unFilterList: response.data,
          filterList: response.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
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
    const filtered = newsTypes.unFilterList.filter((item: BasicModel) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setNewsTypes({
      ...newsTypes,
      filterList: filtered,
    });
  };
  const add = (newsType: BasicModel) => {
    setNewsTypes((prev) => ({
      unFilterList: [newsType, ...prev.unFilterList],
      filterList: [newsType, ...prev.filterList],
    }));
  };
  const edit = (newsType: BasicModel) => {
    setNewsTypes((prev) => {
      const updatedList = [...prev.unFilterList]; // clone the array
      const index = updatedList.findIndex((item) => item.id === newsType.id);

      if (index !== -1) {
        updatedList[index] = newsType; // replace at same position
      }

      return {
        unFilterList: updatedList,
        filterList: updatedList,
      };
    });

    setOnEdit(undefined);
  };

  const per = permissions.sub.get(PermissionEnum.about.sub.news_type);
  const hasAdd = per?.add;
  const hasDelete = per?.delete;
  const hasEdit = per?.edit;
  const hasView = per?.view;
  const remove = async (newsType: BasicModel) => {
    try {
      // 1. Remove from backend
      const response = await axiosClient.delete(`news-types/${newsType.id}`);
      if (response.status === 200) {
        // 2. Remove from frontend
        setNewsTypes((prevJobs) => ({
          unFilterList: prevJobs.unFilterList.filter(
            (item) => item.id !== newsType.id
          ),
          filterList: prevJobs.filterList.filter(
            (item) => item.id !== newsType.id
          ),
        }));
        toast.success(response.data.message);
      }
    } catch (error: any) {
      console.log(error);
    }
  };
  return (
    <div className="relative">
      <div className="rounded-md bg-card p-2 flex gap-x-4 items-baseline mt-4">
        {hasAdd &&
          useMemo(
            () => (
              <NastranModel
                visible={onEdit ? true : false}
                size="lg"
                isDismissable={false}
                button={
                  <PrimaryButton>{`${t("add")} ${t(
                    "news_type"
                  )}`}</PrimaryButton>
                }
                showDialog={async () => true}
              >
                <NewsTypeDialog
                  newsType={onEdit}
                  onComplete={(newsType: BasicModel, isEdited: boolean) =>
                    isEdited ? edit(newsType) : add(newsType)
                  }
                  onCancel={() => setOnEdit(undefined)}
                />
              </NastranModel>
            ),
            [onEdit]
          )}

        <CustomInput
          size_="lg"
          placeholder={`${t("search")}...`}
          parentClassName="w-full md:min-w-90"
          type="text"
          className="bg-card"
          onChange={searchOnChange}
          startContent={
            <Search className="size-[18px] rtl:mr-[4px] text-primary pointer-events-none" />
          }
        />
      </div>
      <Table className="bg-card rounded-md mt-1 py-8 w-full">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("id")}</TableHead>
            <TableHead className="text-start">{t("name")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {loading ? (
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
            </TableRow>
          ) : (
            newsTypes.filterList.map((newsType: BasicModel, index: number) => (
              <TableRowIcon
                read={hasView}
                remove={hasDelete}
                edit={hasEdit}
                onEdit={async (newsType: BasicModel) => setOnEdit(newsType)}
                key={index}
                item={newsType}
                onRemove={remove}
                onRead={async () => {}}
              >
                <TableCell className="font-medium">{newsType.id}</TableCell>
                <TableCell>{newsType.name}</TableCell>
                <TableCell>
                  {toLocaleDate(new Date(newsType.created_at), state)}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
