import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import Pagination from "@/components/custom-ui/table/Pagination";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
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
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import { toLocaleDate } from "@/lib/utils";
import { ListFilter, Repeat2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ViewApprovalDailog from "./view-approval-Dailog";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import type { ApprovalSearch, Order, PaginationData } from "@/lib/types";
import { CACHE } from "@/lib/constants";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { Approval } from "@/database/models";
import { NotifierEnum } from "@/database/model-enums";
import { useDebounce } from "@/hook/use-debounce";
import { useNavigate } from "react-router";
import { DateObject } from "react-multi-date-picker";
import { toast } from "sonner";

export interface ApprovedStepTabProps {
  url: string;
  filters: {
    order: Order;
    search: {
      column: ApprovalSearch;
      value: string;
    };
    mainTab: string | undefined;
    subTab: string | undefined;
  };
}

export default function StepTab(props: ApprovedStepTabProps) {
  const { url, filters } = props;
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  const { getComponentCache } = useCacheDB();
  const [viewDetails, setViewDetails] = useState<{
    approval_id: string;
    view: boolean;
  }>({
    approval_id: "",
    view: false,
  });

  const loadList = async (
    searchInput: string | undefined = undefined,
    count: number | undefined,
    page: number | undefined
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Organize date
      // 2. Send data
      const response = await axiosClient.get(url, {
        params: {
          page: page,
          per_page: count,
          filters: {
            search: {
              column: filters.search.column,
              value: searchInput,
            },
          },
        },
      });
      const fetch = response.data.data as Approval[];
      const lastPage = response.data.last_page;
      const totalItems = response.data.total;
      const perPage = response.data.per_page;
      const currentPage = response.data.current_page;
      setLists({
        filterList: {
          data: fetch,
          lastPage: lastPage,
          totalItems: totalItems,
          perPage: perPage,
          currentPage: currentPage,
        },
        unFilterList: {
          data: fetch,
          lastPage: lastPage,
          totalItems: totalItems,
          perPage: perPage,
          currentPage: currentPage,
        },
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  const initialize = async (
    searchInput: string | undefined = undefined,
    count: number | undefined,
    page: number | undefined
  ) => {
    if (!count) {
      const countSore = await getComponentCache(
        CACHE.APPROVAL_TABLE_PAGINATION_COUNT
      );
      count = countSore?.value ? countSore.value : 10;
    }
    if (!searchInput) {
      searchInput = filters.search.value;
    }
    if (!page) {
      page = 1;
    }
    loadList(searchInput, count, page);
  };
  useEffect(() => {
    initialize(undefined, undefined, 1);
  }, []);
  const [lists, setLists] = useState<{
    filterList: PaginationData<Approval>;
    unFilterList: PaginationData<Approval>;
  }>({
    filterList: {
      data: [],
      lastPage: 1,
      totalItems: 0,
      perPage: 0,
      currentPage: 0,
    },
    unFilterList: {
      data: [],
      lastPage: 1,
      totalItems: 0,
      perPage: 0,
      currentPage: 0,
    },
  });
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [state] = useGlobalState();

  useEffect(() => {
    if (debouncedValue) {
      initialize(debouncedValue, undefined, undefined);
    }
  }, [debouncedValue]);
  const viewApprovalDialog = viewDetails.view && (
    <NastranModel
      size="md"
      visible={true}
      isDismissable={false}
      button={undefined}
      showDialog={async () => true}
    >
      <ViewApprovalDailog
        approval_id={viewDetails.approval_id}
        onComplete={(id: string) => {
          const updatedList = lists.unFilterList.data.filter(
            (item: Approval) => item.id != id
          );
          setLists((prevState) => ({
            filterList: {
              ...prevState.filterList,
              data: updatedList,
            },
            unFilterList: {
              ...prevState.unFilterList,
              data: updatedList,
            },
          }));
        }}
        onClose={() => setViewDetails({ ...viewDetails, view: false })}
      />
    </NastranModel>
  );

  return (
    <>
      {viewApprovalDialog}
      <div className="flex flex-col sm:items-baseline items-start justify-start sm:flex-row rounded-md gap-2 flex-1">
        <CustomInput
          size_="lg"
          placeholder={`${t(filters.search.column)}...`}
          type="text"
          parentClassName="w-full sm:w-[300px] md:w-[540px]"
          startContent={
            <Search className="size-[18px] mx-auto rtl:mr-[4px] text-primary pointer-events-none" />
          }
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value);
            if (!value) initialize(undefined, undefined, undefined);
          }}
        />
        <div className="flex items-center gap-x-4">
          <NastranModel
            size="md"
            isDismissable={false}
            button={
              <SecondaryButton
                className="!px-8 rtl:text-md-rtl ltr:text-md-ltr"
                type="button"
              >
                {t("filter")}
                <ListFilter className="text-secondary mx-2 size-[15px]" />
              </SecondaryButton>
            }
            showDialog={async () => true}
          >
            <FilterDialog
              filters={filters}
              sortOnComplete={async () => {}}
              searchFilterChanged={async (filterName: ApprovalSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("m_t", filters.mainTab ?? "un_authorized");
                  queryParams.set("s_t", filters.subTab ?? "pending");
                  navigate(`/dashboard/approval?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              orderOnComplete={async (filterName: Order) => {
                if (filterName != filters.order) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filterName);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  queryParams.set("m_t", filters.mainTab ?? "un_authorized");
                  queryParams.set("s_t", filters.subTab ?? "pending");
                  navigate(`/dashboard/approval?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              dateOnComplete={(_selectedDates: DateObject[]) => {}}
              filtersShowData={{
                sort: [],
                order: [
                  {
                    name: "asc",
                    translate: t("asc"),
                    onClick: () => {},
                  },
                  {
                    name: "desc",
                    translate: t("desc"),
                    onClick: () => {},
                  },
                ],
                search: [
                  {
                    name: "id",
                    translate: t("id"),
                    onClick: () => {},
                  },
                  {
                    name: "requester",
                    translate: t("requester"),
                    onClick: () => {},
                  },
                  {
                    name: "requester_id",
                    translate: t("requester_id"),
                    onClick: () => {},
                  },
                ],
              }}
              showColumns={{
                sort: false,
                order: true,
                search: true,
                date: false,
              }}
            />
          </NastranModel>
          <Repeat2
            className="size-[22px] cursor-pointer text-primary/85 hover:scale-[1.1] transition-transform duration-300 ease-in-out"
            onClick={async () =>
              await loadList(undefined, undefined, undefined)
            }
          />
        </div>
      </div>
      <Table className="bg-card rounded-md mt-1 py-8 w-full">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("id")}</TableHead>
            <TableHead className="text-start">{t("requester")}</TableHead>
            <TableHead className="text-start">{t("request_date")}</TableHead>
            <TableHead className="text-start">{t("event")}</TableHead>
            <TableHead className="text-start">{t("status")}</TableHead>
            <TableHead className="text-start">{t("documents")}</TableHead>
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
          ) : lists.unFilterList.data.length == 0 ? (
            <TableRow>
              <TableCell
                colSpan={10}
                className="text-center text-primary/90 p-4"
              >
                {t("no_item")}
              </TableCell>
            </TableRow>
          ) : (
            lists.filterList.data.map((approval: Approval, index: number) => (
              <TableRowIcon
                read={true}
                remove={false}
                edit={false}
                onEdit={async (_approval: Approval) => {}}
                key={index}
                item={approval}
                onRemove={async () => {}}
                onRead={async () =>
                  setViewDetails({
                    approval_id: approval.id,
                    view: !viewDetails.view,
                  })
                }
              >
                <TableCell>{approval.id}</TableCell>
                <TableCell>{approval.requester}</TableCell>
                <TableCell className="text-[13px] font-semibold">
                  {toLocaleDate(new Date(approval.request_date), state)}
                </TableCell>
                <TableCell className=" text-nowrap">
                  <BooleanStatusButton
                    className=" mx-0"
                    getColor={function (): {
                      style: string;
                      value?: string;
                    } {
                      return NotifierEnum.confirm_adding_user ===
                        approval.notifier_type_id
                        ? {
                            style: "border-blue-500/90",
                            value: approval.notifier_type,
                          }
                        : {
                            style: "border-orange-500",
                            value: approval.notifier_type,
                          };
                    }}
                  />
                </TableCell>
                <TableCell className=" text-nowrap">
                  <BooleanStatusButton
                    className=" mx-0"
                    getColor={function (): {
                      style: string;
                      value?: string;
                    } {
                      return approval.completed
                        ? {
                            style: "border-green-500/90",
                            value: t("complete"),
                          }
                        : {
                            style: "border-red-500",
                            value: t("pending"),
                          };
                    }}
                  />
                </TableCell>
                <TableCell>{approval.document_count}</TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col-reverse sm:flex-row gap-y-4 justify-between rounded-md bg-card flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${lists.unFilterList.currentPage} ${t("of")} ${
          lists.unFilterList.lastPage
        } / ${t("total")} ${lists.filterList.totalItems}`}</h1>
        <Pagination
          lastPage={lists.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
