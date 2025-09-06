import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGlobalState } from "@/context/GlobalStateContext";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import axiosClient from "@/lib/axois-client";
import Pagination from "@/components/custom-ui/table/Pagination";
import { setDateToURL, toLocaleDate } from "@/lib/utils";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import { ListFilter, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import { DateObject } from "react-multi-date-picker";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { toast } from "sonner";
import type { ErrorLog } from "@/database/models";
import { CACHE } from "@/lib/constants";
import type {
  Order,
  PaginationData,
  ErrorLogSearch,
  ErrorLogSort,
} from "@/lib/types";
import { useDebounce } from "@/hook/use-debounce";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import ErrorLogDialog from "@/views/pages/auth-features/log/parts/error-log-dialog";

export default function LogsTable() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  const { updateComponentCache, getComponentCache } = useCacheDB();
  const [searchParams] = useSearchParams();
  const [onEdit, setOnEdit] = useState<ErrorLog | undefined>(undefined);

  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const filters = {
    sort: sort == null ? "created_at" : (sort as ErrorLogSort),
    order: order == null ? "desc" : (order as Order),
    search: {
      column: searchColumn == null ? "uri" : (searchColumn as ErrorLogSearch),
      value: searchValue == null ? "" : searchValue,
    },
    date:
      startDate && endDate
        ? [
            new DateObject(new Date(startDate)),
            new DateObject(new Date(endDate)),
          ]
        : startDate
        ? [new DateObject(new Date(startDate))]
        : endDate
        ? [new DateObject(new Date(endDate))]
        : [],
  };
  const loadList = async (
    searchInput: string | undefined = undefined,
    count: number | undefined,
    page: number | undefined
  ) => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Organize date
      let dates = {
        startDate: startDate,
        endDate: endDate,
      };
      const response = await axiosClient.get(`logs`, {
        params: {
          page: page,
          per_page: count,
          filters: {
            sort: filters.sort,
            order: filters.order,
            search: {
              column: filters.search.column,
              value: searchInput,
            },
            date: dates,
          },
        },
      });
      const fetch = response.data.logs.data as ErrorLog[];
      const lastPage = response.data.logs.last_page;
      const totalItems = response.data.logs.total;
      const perPage = response.data.logs.per_page;
      const currentPage = response.data.logs.current_page;
      setLogs({
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
        CACHE.LOG_TABLE_PAGINATION_COUNT
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
  }, [sort, startDate, endDate, order]);
  const [logs, setLogs] = useState<{
    filterList: PaginationData<ErrorLog>;
    unFilterList: PaginationData<ErrorLog>;
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

  const skeleton = (
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
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {onEdit && (
        <NastranModel
          visible={onEdit ? true : false}
          size="lg"
          isDismissable={false}
          button={undefined}
          showDialog={async () => true}
        >
          <ErrorLogDialog
            errorLog={onEdit}
            onClose={() => setOnEdit(undefined)}
          />
        </NastranModel>
      )}
      <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center sm:items-baseline rounded-md bg-card gap-2 px-2 py-2 mt-4">
        <CustomInput
          size_="lg"
          placeholder={`${t(filters.search.column)}...`}
          parentClassName="sm:-order-3 col-span-full sm:col-span-1"
          type="text"
          className="md:w-[80%] lg:w-1/2"
          startContent={
            <Search className="size-[18px] mx-auto rtl:mr-[4px] text-primary pointer-events-none" />
          }
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value);
            if (!value) initialize(undefined, undefined, undefined);
          }}
        />
        <NastranModel
          size="lg"
          isDismissable={false}
          button={
            <SecondaryButton
              className="px-8 rtl:text-md-rtl ltr:text-md-ltr -order-2"
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
            sortOnComplete={async (filterName: ErrorLogSort) => {
              if (filterName != filters.sort) {
                const queryParams = new URLSearchParams();
                queryParams.set("sort", filterName);
                queryParams.set("order", filters.order);
                queryParams.set("sch_col", filters.search.column);
                queryParams.set("sch_val", filters.search.value);
                setDateToURL(queryParams, filters.date);
                navigate(`/dashboard/logs?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            searchFilterChanged={async (filterName: ErrorLogSearch) => {
              if (filterName != filters.search.column) {
                const queryParams = new URLSearchParams();
                queryParams.set("sort", filters.sort);
                queryParams.set("order", filters.order);
                queryParams.set("sch_col", filterName);
                queryParams.set("sch_val", filters.search.value);
                setDateToURL(queryParams, filters.date);
                navigate(`/dashboard/logs?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            orderOnComplete={async (filterName: Order) => {
              if (filterName != filters.order) {
                const queryParams = new URLSearchParams();
                queryParams.set("sort", filters.sort);
                queryParams.set("order", filterName);
                queryParams.set("sch_col", filters.search.column);
                queryParams.set("sch_val", filters.search.value);
                setDateToURL(queryParams, filters.date);
                navigate(`/dashboard/logs?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            dateOnComplete={(selectedDates: DateObject[]) => {
              if (selectedDates.length == 2) {
                const queryParams = new URLSearchParams();
                queryParams.set("order", filters.order);
                queryParams.set("sort", filters.sort);
                queryParams.set("sch_col", filters.search.column);
                queryParams.set("sch_val", filters.search.value);
                setDateToURL(queryParams, selectedDates);
                navigate(`/dashboard/logs?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            filtersShowData={{
              sort: [
                {
                  name: "uri",
                  translate: t("uri"),
                  onClick: () => {},
                },
                {
                  name: "method",
                  translate: t("method"),
                  onClick: () => {},
                },
                {
                  name: "created_at",
                  translate: t("date"),
                  onClick: () => {},
                },
              ],
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
                  name: "uri",
                  translate: t("uri"),
                  onClick: () => {},
                },
                {
                  name: "error_code",
                  translate: t("error_code"),
                  onClick: () => {},
                },
                {
                  name: "ip_address",
                  translate: t("ip_address"),
                  onClick: () => {},
                },
                {
                  name: "exception_type",
                  translate: t("exception_type"),
                  onClick: () => {},
                },
              ],
            }}
            showColumns={{
              sort: true,
              order: true,
              search: true,
              date: true,
            }}
          />
        </NastranModel>
        <CustomSelect
          paginationKey={CACHE.LOG_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline -order-1"
          updateCache={updateComponentCache}
          getCache={async () =>
            await getComponentCache(CACHE.LOG_TABLE_PAGINATION_COUNT)
          }
          placeholder={`${t("select")}...`}
          emptyPlaceholder={t("no_options_found")}
          rangePlaceholder={t("count")}
          onChange={async (value: string) =>
            await initialize(undefined, parseInt(value), undefined)
          }
        />
      </div>
      <Table className="bg-card rounded-md my-[2px] py-8">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("uri")}</TableHead>
            <TableHead className="text-start">{t("method")}</TableHead>
            <TableHead className="text-start">{t("error_code")}</TableHead>
            <TableHead className="text-start">{t("ip_address")}</TableHead>
            <TableHead className="text-start">{t("exception_type")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {loading ? (
            <>{skeleton}</>
          ) : (
            logs.filterList.data.map((item: ErrorLog) => (
              <TableRowIcon
                key={item.id}
                onRemove={async () => {}}
                onEdit={async () => {}}
                onRead={async () => setOnEdit(item)}
                read={true}
                item={item}
              >
                <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                  {item.uri}
                </TableCell>
                <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                  {item.method}
                </TableCell>
                <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                  {item.error_code}
                </TableCell>
                <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                  {item.ip_address}
                </TableCell>
                <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                  {item.exception_type}
                </TableCell>
                <TableCell className="truncate">
                  {toLocaleDate(new Date(item.created_at), state)}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col-reverse sm:flex-row gap-y-4 justify-between rounded-md bg-card flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${logs.unFilterList.currentPage} ${t("of")} ${
          logs.unFilterList.lastPage
        } / ${t("total")} ${logs.filterList.totalItems}`}</h1>
        <Pagination
          lastPage={logs.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
