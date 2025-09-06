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
import { useNavigate, useSearchParams } from "react-router";
import axiosClient from "@/lib/axois-client";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import Pagination from "@/components/custom-ui/table/Pagination";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import { setDateToURL } from "@/lib/utils";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { ListFilter, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import { DateObject } from "react-multi-date-picker";

import useCacheDB from "@/lib/indexeddb/useCacheDB";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import AddDonor from "./add/add-donor";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type {
  DonorInformation,
  DonorSearch,
  DonorSort,
  Order,
  PaginationData,
} from "@/lib/types";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { UserPermission } from "@/database/models";
import { PermissionEnum } from "@/database/model-enums";
import { useDebounce } from "@/hook/use-debounce";

export function DonorTable() {
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
    sort: sort == null ? "id" : (sort as DonorSort),
    order: order == null ? "desc" : (order as Order),
    search: {
      column: searchColumn == null ? "abbr" : (searchColumn as DonorSearch),
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
      const response = await axiosClient.get(`donors`, {
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
      const fetch = response.data.donor.data as DonorInformation[];
      const lastPage = response.data.donor.last_page;
      const totalItems = response.data.donor.total;
      const perPage = response.data.donor.per_page;
      const currentPage = response.data.donor.current_page;
      setDonors({
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
        CACHE.DONOR_TABLE_PAGINATION_COUNT
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
    if (debouncedValue) {
      initialize(debouncedValue, undefined, undefined);
    }
  }, [debouncedValue]);
  useEffect(() => {
    initialize(undefined, undefined, 1);
  }, [sort, startDate, endDate, order]);
  const [donors, setDonors] = useState<{
    filterList: PaginationData<DonorInformation>;
    unFilterList: PaginationData<DonorInformation>;
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
  const addItem = (donor: DonorInformation) => {
    setDonors((prevState) => ({
      filterList: {
        ...prevState.filterList,
        data: [donor, ...prevState.filterList.data],
      },
      unFilterList: {
        ...prevState.unFilterList,
        data: [donor, ...prevState.unFilterList.data],
      },
    }));
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
    PermissionEnum.donor.name
  ) as UserPermission;
  const hasView = per?.view;
  const hasAdd = per?.add;

  const watchOnClick = async (donor: DonorInformation) => {
    const donorId = donor.id;
    navigate(`/dashboard/donors/${donorId}`);
  };
  return (
    <>
      <div className="flex flex-col sm:items-baseline sm:flex-row rounded-md bg-card dark:!bg-black/30 gap-2 flex-1 px-2 py-2 mt-4">
        {hasAdd && (
          <NastranModel
            size="md"
            isDismissable={false}
            button={
              <PrimaryButton className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr">
                {t("register_donor")}
              </PrimaryButton>
            }
            showDialog={async () => true}
          >
            <AddDonor onComplete={addItem} />
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
              sortOnComplete={async (filterName: DonorSort) => {
                if (filterName != filters.sort) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filterName);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/donor?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              searchFilterChanged={async (filterName: DonorSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/donor?${queryParams.toString()}`, {
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
                  navigate(`/donor?${queryParams.toString()}`, {
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
                  navigate(`/donor?${queryParams.toString()}`, {
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
                    name: "name",
                    translate: t("name"),
                    onClick: () => {},
                  },
                  {
                    name: "contact",
                    translate: t("contact"),
                    onClick: () => {},
                  },
                  {
                    name: "status",
                    translate: t("status"),
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
                    name: "registration_no",
                    translate: t("registration_no"),
                    onClick: () => {},
                  },
                  { name: "name", translate: t("name"), onClick: () => {} },
                  { name: "type", translate: t("type"), onClick: () => {} },
                  {
                    name: "contact",
                    translate: t("contact"),
                    onClick: () => {},
                  },
                  {
                    name: "email",
                    translate: t("email"),
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
          paginationKey={CACHE.DONOR_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline"
          updateCache={(data: any) => updateComponentCache(data)}
          getCache={async () =>
            await getComponentCache(CACHE.DONOR_TABLE_PAGINATION_COUNT)
          }
          placeholder={`${t("select")}...`}
          emptyPlaceholder={t("no_options_found")}
          rangePlaceholder={t("count")}
          onChange={async (value: string) =>
            await initialize(undefined, parseInt(value), undefined)
          }
        />
      </div>
      <Table className="bg-card dark:bg-card-secondary rounded-md my-[2px] py-8">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-start">{t("id")}</TableHead>
            <TableHead className="text-center w-[60px]">{t("pic")}</TableHead>
            <TableHead className="text-start">{t("abbr")}</TableHead>
            <TableHead className="text-start">{t("name")}</TableHead>
            <TableHead className="text-start">{t("username")}</TableHead>
            <TableHead className="text-start">{t("contact")}</TableHead>
            <TableHead className="text-start">{t("email")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {loading ? (
            <>{skeleton}</>
          ) : (
            donors.filterList.data.map((item: DonorInformation) => (
              <TableRowIcon
                read={hasView}
                remove={false}
                edit={false}
                onEdit={async () => {}}
                key={item.name}
                item={item}
                onRemove={async () => {}}
                onRead={watchOnClick}
              >
                <TableCell>{item.id}</TableCell>
                <TableCell>
                  <CachedImage
                    src={item?.profile}
                    alt="Avatar"
                    ShimmerIconClassName="size-[18px]"
                    shimmerClassName="size-[36px] mx-auto shadow-lg border border-tertiary rounded-full"
                    className="size-[36px] object-center object-cover mx-auto shadow-lg border border-tertiary rounded-full"
                    routeIdentifier={"profile"}
                  />
                </TableCell>
                <TableCell>{item.abbr}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.username}</TableCell>
                <TableCell
                  className="rtl:text-md-rtl truncate rtl:text-end"
                  dir="ltr"
                >
                  {item.contact}
                </TableCell>
                <TableCell className="rtl:text-md-rtl truncate">
                  {item.email}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between rounded-md bg-card dark:bg-card-secondary flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${donors.unFilterList.currentPage} ${t("of")} ${
          donors.unFilterList.lastPage
        } / ${t("total")} ${donors.filterList.totalItems}`}</h1>
        <Pagination
          lastPage={donors.unFilterList.lastPage}
          onPageChange={async (page) =>
            await initialize(undefined, undefined, page)
          }
        />
      </div>
    </>
  );
}
