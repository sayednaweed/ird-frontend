import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CACHE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router";
import axiosClient from "@/lib/axois-client";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
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
import CachedImage from "@/components/custom-ui/image/CachedImage";
import { useGlobalState } from "@/context/GlobalStateContext";
import type { ActivitySearch, Order, PaginationData } from "@/lib/types";
import type { ActivityModel } from "@/database/models";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { toast } from "sonner";
import { useDebounce } from "@/hook/use-debounce";

export function Activity() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  let { id } = useParams();

  const debouncedValue = useDebounce(inputValue, 500);
  const { updateComponentCache, getComponentCache } = useCacheDB();
  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const order = searchParams.get("order");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const filters = {
    order: order == null ? "desc" : (order as Order),
    search: {
      column:
        searchColumn == null ? "username" : (searchColumn as ActivitySearch),
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
      // 2. Send data
      const response = await axiosClient.get(`activities`, {
        params: {
          page: page,
          per_page: count,
          filters: {
            order: filters.order,
            search: {
              column: filters.search.column,
              value: searchInput,
            },
            date: dates,
          },
        },
      });
      const fetch = response.data.logs.data as ActivityModel[];
      const lastPage = response.data.logs.last_page;
      const totalItems = response.data.logs.total;
      const perPage = response.data.logs.per_page;
      const currentPage = response.data.logs.current_page;
      setActivities({
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
        CACHE.USER_TABLE_PAGINATION_COUNT
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
  }, [startDate, endDate, order]);
  const [activities, setActivities] = useState<{
    filterList: PaginationData<ActivityModel>;
    unFilterList: PaginationData<ActivityModel>;
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
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <div className="grid grid-cols-[1fr_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-end sm:items-baseline gap-2 px-2 py-2 mt-4 bg-card rounded-md">
        <CustomInput
          size_="lg"
          placeholder={`${t(filters.search.column)}...`}
          parentClassName="col-span-full sm:col-span-2 sm:place-self-auto"
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
        <div className="flex items-baseline gap-2">
          <NastranModel
            size="lg"
            isDismissable={false}
            button={
              <SecondaryButton
                className="px-8 rtl:text-md-rtl ltr:text-md-ltr"
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
              searchFilterChanged={async (filterName: ActivitySearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(
                    `/dashboard/activity/${id}?${queryParams.toString()}`,
                    { replace: true }
                  );
                }
              }}
              orderOnComplete={async (filterName: Order) => {
                if (filterName != filters.order) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filterName);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(
                    `/dashboard/activity/${id}?${queryParams.toString()}`,
                    { replace: true }
                  );
                }
              }}
              dateOnComplete={(selectedDates: DateObject[]) => {
                if (selectedDates.length == 2) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, selectedDates);
                  navigate(
                    `/dashboard/activity/${id}?${queryParams.toString()}`,
                    { replace: true }
                  );
                }
              }}
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
                    name: "username",
                    translate: t("username"),
                    onClick: () => {},
                  },
                  { name: "type", translate: t("type"), onClick: () => {} },
                ],
              }}
              showColumns={{
                sort: false,
                order: true,
                search: true,
                date: true,
              }}
            />
          </NastranModel>
          <CustomSelect
            paginationKey={CACHE.USER_ACTIVITY_TABLE_PAGINATION_COUNT}
            options={[
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
            className="w-fit sm:self-baseline"
            updateCache={(data: any) => updateComponentCache(data)}
            getCache={async () =>
              await getComponentCache(
                CACHE.USER_ACTIVITY_TABLE_PAGINATION_COUNT
              )
            }
            placeholder={`${t("select")}...`}
            emptyPlaceholder={t("no_options_found")}
            rangePlaceholder={t("count")}
            onChange={async (value: string) =>
              await initialize(undefined, parseInt(value), undefined)
            }
          />
        </div>
      </div>
      <Table className="bg-card dark:bg-card-secondary rounded-md my-[2px] py-8">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("profile")}</TableHead>
            <TableHead className="text-start">{t("username")}</TableHead>
            <TableHead className="text-start">{t("type")}</TableHead>
            <TableHead className="text-start">{t("event")}</TableHead>
            <TableHead className="text-start">{t("ip_address")}</TableHead>
            <TableHead className="text-start">{t("device")}</TableHead>
            <TableHead className="text-start">{t("browser")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {loading ? (
            <>{skeleton}</>
          ) : (
            activities.filterList.data.map(
              (item: ActivityModel, index: number) => (
                <TableRowIcon
                  read={false}
                  remove={false}
                  edit={false}
                  onEdit={async () => {}}
                  key={index}
                  item={item}
                  onRemove={async () => {}}
                  onRead={async () => {}}
                >
                  <TableCell>
                    <CachedImage
                      src={item?.profile}
                      alt="Avatar"
                      ShimmerIconClassName="size-[18px]"
                      shimmerClassName="size-[36px] shadow-lg border border-tertiary rounded-full"
                      className="size-[36px] object-center object-cover shadow-lg border border-tertiary rounded-full"
                      routeIdentifier={"profile"}
                    />
                  </TableCell>
                  <TableCell className="truncate">{item.username}</TableCell>
                  <TableCell className="truncate">
                    {item.userable_type}
                  </TableCell>
                  <TableCell className="truncate">{item.action}</TableCell>
                  <TableCell className="truncate">{item.ip_address}</TableCell>
                  <TableCell className="truncate">{item.platform}</TableCell>
                  <TableCell className="truncate">{item.browser}</TableCell>
                  <TableCell className="truncate">
                    {toLocaleDate(new Date(item.date), state)}
                  </TableCell>
                </TableRowIcon>
              )
            )
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between rounded-md bg-card dark:bg-card-secondary flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${activities.unFilterList.currentPage} ${t("of")} ${
          activities.unFilterList.lastPage
        } / ${t("total")} ${activities.filterList.totalItems}`}</h1>
        <Pagination
          lastPage={activities.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
