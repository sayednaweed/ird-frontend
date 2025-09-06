import { CACHE } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router";
import axiosClient from "@/lib/axois-client";
import Pagination from "@/components/custom-ui/table/Pagination";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { ListFilter, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import { DateObject } from "react-multi-date-picker";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import AddNews from "./add/add-news";
import { useGlobalState } from "@/context/GlobalStateContext";
import { setDateToURL, toLocaleDate } from "@/lib/utils";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import type { NewsSearch, NewsSort, Order, PaginationData } from "@/lib/types";
import type { News, UserPermission } from "@/database/models";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { useDebounce } from "@/hook/use-debounce";

export interface NewsTabProps {
  permissions: UserPermission;
}
export default function NewsTab(props: NewsTabProps) {
  const { permissions } = props;
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  const { updateComponentCache, getComponentCache } = useCacheDB();
  let { id } = useParams();

  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  useEffect(() => {
    if (debouncedValue) {
      initialize(debouncedValue, undefined, undefined);
    }
  }, [debouncedValue]);
  const filters = {
    sort: sort == null ? "date" : (sort as NewsSort),
    order: order == null ? "asc" : (order as Order),
    search: {
      column: searchColumn == null ? "title" : (searchColumn as NewsSearch),
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
      const response = await axiosClient.get(`newses`, {
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
      const fetch = response.data.newses.data as News[];
      const lastPage = response.data.newses.last_page;
      const totalItems = response.data.newses.total;
      const perPage = response.data.newses.per_page;
      const currentPage = response.data.newses.current_page;
      setNewsList({
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
      toast.error(error.response.data.message);
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
        CACHE.NEWS_TABLE_PAGINATION_COUNT
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
  }, [sort, startDate, endDate, order, searchColumn, searchValue]);
  const [newsList, setNewsList] = useState<{
    filterList: PaginationData<News>;
    unFilterList: PaginationData<News>;
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

  const addItem = (news: News) => {
    setNewsList((prevState) => ({
      filterList: {
        ...prevState.filterList,
        data: [news, ...prevState.filterList.data],
      },
      unFilterList: {
        ...prevState.unFilterList,
        data: [news, ...prevState.unFilterList.data],
      },
    }));
  };

  const deleteOnClick = async (news: News) => {
    try {
      const newsId = news.id;
      const response = await axiosClient.delete("news/" + newsId);
      if (response.status == 200) {
        const filtered = newsList.unFilterList.data.filter(
          (item: News) => newsId != item?.id
        );
        const item = {
          data: filtered,
          lastPage: newsList.unFilterList.lastPage,
          totalItems: newsList.unFilterList.totalItems,
          perPage: newsList.unFilterList.perPage,
          currentPage: newsList.unFilterList.currentPage,
        };
        setNewsList({ ...newsList, filterList: item, unFilterList: item });
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const per = permissions.sub.get(PermissionEnum.about.sub.news);
  const add = per?.add;
  const remove = per?.delete;
  const edit = per?.edit;
  const editOnClick = async (news: News) => {
    const newsId = news.id;
    navigate(`/dashboard/about/news/${newsId}`);
  };

  return (
    <>
      <div className="flex flex-col sm:items-baseline sm:flex-row rounded-md bg-card gap-2 flex-1 px-2 py-2 mt-4">
        {add && (
          <NastranModel
            size="lg"
            isDismissable={false}
            button={
              <PrimaryButton className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr">
                {t("add_news")}
              </PrimaryButton>
            }
            showDialog={async () => true}
          >
            <AddNews onComplete={addItem} />
          </NastranModel>
        )}

        <CustomInput
          size_="lg"
          placeholder={`${t(filters.search.column)}...`}
          parentClassName="sm:flex-1 col-span-3"
          type="text"
          startContent={
            <Search className="size-[18px] mx-auto rtl:mr-[4px] text-primary pointer-events-none" />
          }
          onChange={(e) => {
            const { value } = e.target;
            setInputValue(value);
            if (!value) initialize(undefined, undefined, undefined);
          }}
        />
        <div className="sm:px-4 col-span-3 flex-1 self-start sm:self-baseline flex justify-end items-center">
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
              sortOnComplete={async (filterName: NewsSort) => {
                if (filterName != filters.sort) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filterName);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/dashboard/about/${id}?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              searchFilterChanged={async (filterName: NewsSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/dashboard/about/${id}?${queryParams.toString()}`, {
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
                  navigate(`/dashboard/about/${id}?${queryParams.toString()}`, {
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
                  navigate(`/management/news?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              filtersShowData={{
                sort: [
                  {
                    name: "id",
                    translate: t("id"),
                    onClick: () => {},
                  },
                  {
                    name: "type",
                    translate: t("type"),
                    onClick: () => {},
                  },
                  {
                    name: "priority",
                    translate: t("priority"),
                    onClick: () => {},
                  },
                  {
                    name: "visible",
                    translate: t("visible"),
                    onClick: () => {},
                  },
                  {
                    name: "visibility_date",
                    translate: t("visibility_date"),
                    onClick: () => {},
                  },
                  { name: "date", translate: t("date"), onClick: () => {} },
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
                    name: "title",
                    translate: t("title"),
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
        </div>

        <CustomSelect
          paginationKey={CACHE.NEWS_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline"
          updateCache={updateComponentCache}
          getCache={async () =>
            await getComponentCache(CACHE.NEWS_TABLE_PAGINATION_COUNT)
          }
          placeholder={`${t("select")}...`}
          emptyPlaceholder={t("no_options_found")}
          rangePlaceholder={t("count")}
          onChange={async (value: string) =>
            await initialize(undefined, parseInt(value), undefined)
          }
        />
      </div>
      <Table className="bg-card rounded-md mt-1 py-8 w-full">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-center">{t("picture")}</TableHead>
            <TableHead className="text-start">{t("id")}</TableHead>
            <TableHead className="text-start">{t("title")}</TableHead>
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
              <TableCell>
                <Shimmer className="h-[24px] w-full rounded-sm" />
              </TableCell>
            </TableRow>
          ) : newsList.filterList.data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={12} className="text-center">
                <h1>{t("no_content")}</h1>
              </TableCell>
            </TableRow>
          ) : (
            newsList.filterList.data.map((news: News) => (
              <TableRowIcon
                read={false}
                remove={remove}
                edit={edit}
                onEdit={editOnClick}
                key={news.id}
                item={news}
                onRemove={deleteOnClick}
                onRead={async () => {}}
              >
                <TableCell className="max-w-44">
                  <CachedImage
                    src={news?.image}
                    alt="Avatar"
                    ShimmerIconClassName="size-[18px]"
                    shimmerClassName="size-[36px] mx-auto shadow-lg border border-tertiary rounded-full"
                    className="size-[36px] object-center object-cover mx-auto shadow-lg border border-tertiary rounded-full"
                    routeIdentifier={"public"}
                  />
                </TableCell>
                <TableCell className="font-medium">{news.id}</TableCell>

                <TableCell className=" truncate max-w-32">
                  {news.title}
                </TableCell>
                <TableCell>
                  {toLocaleDate(new Date(news.created_at), state)}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between rounded-md bg-card flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${newsList.unFilterList.currentPage} ${t("of")} ${
          newsList.unFilterList.lastPage
        } / ${t("total")} ${newsList.filterList.totalItems}`}</h1>
        <Pagination
          lastPage={newsList.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
