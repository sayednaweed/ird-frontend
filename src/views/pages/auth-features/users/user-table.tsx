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

import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import Pagination from "@/components/custom-ui/table/Pagination";
import { setDateToURL, toLocaleDate } from "@/lib/utils";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { ListFilter, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import AddUser from "./add/add-user";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import { DateObject } from "react-multi-date-picker";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { toast } from "sonner";
import type { User, UserPermission } from "@/database/models";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import { CACHE } from "@/lib/constants";
import { PermissionEnum, StatusEnum } from "@/database/model-enums";
import type { Order, PaginationData, UserSearch, UserSort } from "@/lib/types";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import { useDebounce } from "@/hook/use-debounce";

export function UserTable() {
  const { user } = useUserAuthState();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  const { updateComponentCache, getComponentCache } = useCacheDB();
  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const filters = {
    sort: sort == null ? "created_at" : (sort as UserSort),
    order: order == null ? "desc" : (order as Order),
    search: {
      column: searchColumn == null ? "username" : (searchColumn as UserSearch),
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
      const response = await axiosClient.get(`users`, {
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
      const fetch = response.data.users.data as User[];
      const lastPage = response.data.users.last_page;
      const totalItems = response.data.users.total;
      const perPage = response.data.users.per_page;
      const currentPage = response.data.users.current_page;
      setUsers({
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
  }, [sort, startDate, endDate, order]);
  const [users, setUsers] = useState<{
    filterList: PaginationData<User>;
    unFilterList: PaginationData<User>;
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

  const addItem = (user: User) => {
    setUsers((prevState) => ({
      filterList: {
        ...prevState.filterList,
        data: [user, ...prevState.unFilterList.data],
      },
      unFilterList: {
        ...prevState.unFilterList,
        data: [user, ...prevState.unFilterList.data],
      },
    }));
  };
  useEffect(() => {
    if (debouncedValue) {
      initialize(debouncedValue, undefined, undefined);
    }
  }, [debouncedValue]);
  const deleteOnClick = async (user: User) => {
    try {
      const userId = user.id;
      const response = await axiosClient.delete("user/" + userId);
      if (response.status == 200) {
        const filtered = users.unFilterList.data.filter(
          (item: User) => userId != item?.id
        );
        const item = {
          data: filtered,
          lastPage: users.unFilterList.lastPage,
          totalItems: users.unFilterList.totalItems,
          perPage: users.unFilterList.perPage,
          currentPage: users.unFilterList.currentPage,
        };
        setUsers({ ...users, filterList: item, unFilterList: item });
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    }
  };
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
  const per: UserPermission = user?.permissions.get(
    PermissionEnum.users.name
  ) as UserPermission;
  const hasView = per?.view;
  const hasAdd = per?.add;
  const hasDelete = per?.delete;

  const watchOnClick = async (user: User) => {
    const userId = user.id;
    navigate(`/dashboard/users/${userId}`);
  };
  return (
    <>
      <div className="grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[auto_1fr_auto_auto_auto] items-center sm:items-baseline rounded-md bg-card gap-2 px-2 py-2 mt-4">
        {hasAdd && (
          <NastranModel
            size="lg"
            isDismissable={false}
            button={
              <PrimaryButton className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr -order-4">
                {t("add")}
              </PrimaryButton>
            }
            showDialog={async () => true}
          >
            <AddUser onComplete={addItem} />
          </NastranModel>
        )}

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
            sortOnComplete={async (filterName: UserSort) => {
              if (filterName != filters.sort) {
                const queryParams = new URLSearchParams();
                queryParams.set("sort", filterName);
                queryParams.set("order", filters.order);
                queryParams.set("sch_col", filters.search.column);
                queryParams.set("sch_val", filters.search.value);
                setDateToURL(queryParams, filters.date);
                navigate(`/dashboard/users?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            searchFilterChanged={async (filterName: UserSearch) => {
              if (filterName != filters.search.column) {
                const queryParams = new URLSearchParams();
                queryParams.set("sort", filters.sort);
                queryParams.set("order", filters.order);
                queryParams.set("sch_col", filterName);
                queryParams.set("sch_val", filters.search.value);
                setDateToURL(queryParams, filters.date);
                navigate(`/dashboard/users?${queryParams.toString()}`, {
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
                navigate(`/dashboard/users?${queryParams.toString()}`, {
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
                navigate(`/dashboard/users?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            filtersShowData={{
              sort: [
                {
                  name: "created_at",
                  translate: t("date"),
                  onClick: () => {},
                },
                {
                  name: "username",
                  translate: t("username"),
                  onClick: () => {},
                },
                {
                  name: "division",
                  translate: t("division"),
                  onClick: () => {},
                },
                { name: "status", translate: t("status"), onClick: () => {} },
                { name: "job", translate: t("job"), onClick: () => {} },
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
                  name: "username",
                  translate: t("username"),
                  onClick: () => {},
                },
                { name: "email", translate: t("email"), onClick: () => {} },
                {
                  name: "contact",
                  translate: t("contact"),
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
          paginationKey={CACHE.USER_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline -order-1"
          updateCache={updateComponentCache}
          getCache={async () =>
            await getComponentCache(CACHE.USER_TABLE_PAGINATION_COUNT)
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
            <TableHead className="text-center px-1 w-[60px]">
              {t("profile")}
            </TableHead>
            <TableHead className="text-start">{t("username")}</TableHead>
            <TableHead className="text-start">{t("role")}</TableHead>
            <TableHead className="text-start">{t("email")}</TableHead>
            <TableHead className="text-start">{t("contact")}</TableHead>
            <TableHead className="text-start">{t("join_date")}</TableHead>
            <TableHead className="text-start w-[60px]">{t("status")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {loading ? (
            <>{skeleton}</>
          ) : (
            users.filterList.data.map((item: User) => (
              <TableRowIcon
                read={hasView}
                remove={hasDelete}
                edit={false}
                onEdit={async () => {}}
                key={item.email}
                item={item}
                onRemove={deleteOnClick}
                onRead={watchOnClick}
              >
                <TableCell className="px-1 py-0">
                  <CachedImage
                    src={item?.profile}
                    alt="Avatar"
                    ShimmerIconClassName="size-[18px]"
                    shimmerClassName="size-[36px] mx-auto shadow-lg border border-tertiary rounded-full"
                    className="size-[36px] object-center object-cover mx-auto shadow-lg border border-tertiary rounded-full"
                    routeIdentifier={"private"}
                  />
                </TableCell>
                <TableCell className="rtl:text-md-rtl truncate px-1 py-0">
                  {item.username}
                </TableCell>
                <TableCell>
                  <h1 className="truncate">{item?.division}</h1>
                  <h1 className="truncate text-primary/90">{item?.job}</h1>
                </TableCell>
                <TableCell
                  dir="ltr"
                  className="truncate rtl:text-sm-rtl rtl:text-end"
                >
                  {item.email}
                </TableCell>
                <TableCell
                  dir="ltr"
                  className="rtl:text-end rtl:text-sm-rtl truncate"
                >
                  {item?.contact == "null" ? "" : item?.contact}
                </TableCell>
                <TableCell className="truncate">
                  {toLocaleDate(new Date(item.created_at), state)}
                </TableCell>
                <TableCell>
                  <BooleanStatusButton
                    getColor={function (): {
                      style: string;
                      value?: string;
                    } {
                      return StatusEnum.active === item.status_id
                        ? {
                            style: "border-green-500/90",
                            value: item.status,
                          }
                        : {
                            style: "border-red-500",
                            value: item.status,
                          };
                    }}
                  />
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex flex-col-reverse sm:flex-row gap-y-4 justify-between rounded-md bg-card flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${users.unFilterList.currentPage} ${t("of")} ${
          users.unFilterList.lastPage
        } / ${t("total")} ${users.filterList.totalItems}`}</h1>
        <Pagination
          lastPage={users.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
