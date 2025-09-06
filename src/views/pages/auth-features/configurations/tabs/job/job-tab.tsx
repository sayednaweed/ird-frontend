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
import JobDialog from "./job-dialog";
import type { BasicModel, UserPermission } from "@/database/models";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
interface JobTabProps {
  permissions: UserPermission;
}
export default function JobTab(props: JobTabProps) {
  const { permissions } = props;
  const { t } = useTranslation();
  const [state] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<{
    visible: boolean;
    job: any;
  }>({
    visible: false,
    job: undefined,
  });
  const [jobs, setJobs] = useState<{
    unFilterList: BasicModel[];
    filterList: BasicModel[];
  }>({
    unFilterList: [],
    filterList: [],
  });
  const initialize = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // 2. Send data
      const response = await axiosClient.get(`jobs`);
      const fetch = response.data as BasicModel[];
      setJobs({
        unFilterList: fetch,
        filterList: fetch,
      });
    } catch (error: any) {
      toast.success(error.response.data.message);
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
    const filtered = jobs.unFilterList.filter((item: BasicModel) =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );
    setJobs({
      ...jobs,
      filterList: filtered,
    });
  };
  const add = (job: BasicModel) => {
    setJobs((prev) => ({
      unFilterList: [job, ...prev.unFilterList],
      filterList: [job, ...prev.filterList],
    }));
  };
  const update = (job: BasicModel) => {
    setJobs((prevState) => {
      const updatedUnFiltered = prevState.unFilterList.map((item) =>
        item.id === job.id ? { ...item, name: job.name } : item
      );

      return {
        ...prevState,
        unFilterList: updatedUnFiltered,
        filterList: updatedUnFiltered,
      };
    });
  };
  const remove = async (job: BasicModel) => {
    try {
      // 1. Remove from backend
      const response = await axiosClient.delete(`jobs/${job.id}`);
      if (response.status === 200) {
        // 2. Remove from frontend
        setJobs((prevJobs) => ({
          unFilterList: prevJobs.unFilterList.filter(
            (item) => item.id !== job.id
          ),
          filterList: prevJobs.filterList.filter((item) => item.id !== job.id),
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
            job: undefined,
          });
          return true;
        }}
      >
        <JobDialog job={selected.job} onComplete={update} />
      </NastranModel>
    ),
    [selected.visible]
  );
  const job = permissions.sub.get(
    PermissionEnum.configurations.sub.configurations_job
  );
  const hasEdit = job?.edit;
  const hasAdd = job?.add;
  const hasDelete = job?.delete;
  const hasView = job?.view;
  return (
    <div className="relative">
      <div className="rounded-md bg-card p-2 flex gap-x-4 items-baseline mt-4">
        {hasAdd && (
          <NastranModel
            size="lg"
            isDismissable={false}
            button={<PrimaryButton>{t("add_job")}</PrimaryButton>}
            showDialog={async () => true}
          >
            <JobDialog onComplete={add} />
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
            jobs.filterList.map((job: BasicModel, index: number) => (
              <TableRowIcon
                read={hasView}
                remove={hasDelete}
                edit={hasEdit}
                onEdit={async (job: BasicModel) => {
                  setSelected({
                    visible: true,
                    job: job,
                  });
                }}
                key={index}
                item={job}
                onRemove={remove}
                onRead={async () => {}}
              >
                <TableCell className="font-medium">{job.id}</TableCell>
                <TableCell>{job.name}</TableCell>
                <TableCell>
                  {toLocaleDate(new Date(job.created_at), state)}
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
