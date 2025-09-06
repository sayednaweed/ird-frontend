import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ListFilter, Repeat2, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import { DateObject } from "react-multi-date-picker";

import useCacheDB from "@/lib/indexeddb/useCacheDB";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type {
  OrganizationInformation,
  OrganizationSearch,
  OrganizationSort,
  Order,
  PaginationData,
} from "@/lib/types";
import { CACHE } from "@/lib/constants";
import { useDatasource } from "@/hook/use-datasource";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { PermissionEnum, StatusEnum } from "@/database/model-enums";
import type { UserPermission } from "@/database/models";
import AddOrganization from "@/views/pages/auth-features/organization/add/add-organization";
import { useDebounce } from "@/hook/use-debounce";

export function OrganizationTable() {
  const { user } = useUserAuthState();
  const navigate = useNavigate();
  const { updateComponentCache, getComponentCache } = useCacheDB();
  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const page = searchParams.get("page");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const filters = {
    sort: sort == null ? "name" : (sort as OrganizationSort),
    page: page == null ? "1" : page,
    order: order == null ? "desc" : (order as Order),
    search: {
      column:
        searchColumn == null ? "name" : (searchColumn as OrganizationSearch),
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
  const [inputValue, setInputValue] = useState(searchValue);
  const debouncedValue = useDebounce(inputValue, 500);
  const loadList = async () => {
    const countSore = await getComponentCache(CACHE.ORG_TABLE_PAGINATION_COUNT);
    const count = countSore?.value ? countSore.value : 10;
    // 1. Organize date
    let dates = {
      startDate: startDate,
      endDate: endDate,
    };
    // 2. Send data
    const response = await axiosClient.get(`organizations`, {
      params: {
        page: filters.page,
        per_page: count,
        filters: {
          sort: filters.sort,
          order: filters.order,
          search: {
            column: filters.search.column,
            value: filters.search.value,
          },
          date: dates,
        },
      },
    });
    const fetch = response.data.organizations.data as OrganizationInformation[];
    const lastPage = response.data.organizations.last_page;
    const totalItems = response.data.organizations.total;
    const perPage = response.data.organizations.per_page;
    const currentPage = response.data.organizations.current_page;

    return {
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
    };
  };
  const { organizations, setOrganizations, isLoading, refetch } = useDatasource<
    {
      filterList: PaginationData<OrganizationInformation>;
      unFilterList: PaginationData<OrganizationInformation>;
    },
    "organizations"
  >(
    {
      queryFn: loadList,
      queryKey: "organizations",
    },
    [sort, startDate, endDate, order, searchValue],
    {
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
    }
  );
  useEffect(() => {
    if (debouncedValue) {
      const queryParams = new URLSearchParams();
      queryParams.set("sort", filters.sort);
      queryParams.set("order", filters.order);
      queryParams.set("page", filters.page);
      queryParams.set("sch_col", filters.search.column);
      queryParams.set("sch_val", debouncedValue);
      setDateToURL(queryParams, filters.date);
      navigate(`/dashboard/organizations?${queryParams.toString()}`, {
        replace: true,
      });
    }
  }, [debouncedValue]);
  const { t } = useTranslation();
  const addItem = (organization: OrganizationInformation) => {
    setOrganizations((prevState) => ({
      filterList: {
        ...prevState.filterList,
        data: [organization, ...prevState.filterList.data],
      },
      unFilterList: {
        ...prevState.unFilterList,
        data: [organization, ...prevState.unFilterList.data],
      },
    }));
  };

  const deleteOnClick = async (organization: OrganizationInformation) => {
    try {
      const organizationId = organization.id;
      const response = await axiosClient.delete(
        "organization/" + organizationId
      );
      if (response.status == 200) {
        const filtered = organizations.unFilterList.data.filter(
          (item: OrganizationInformation) => organizationId != item?.id
        );
        const item = {
          data: filtered,
          lastPage: organizations.unFilterList.lastPage,
          totalItems: organizations.unFilterList.totalItems,
          perPage: organizations.unFilterList.perPage,
          currentPage: organizations.unFilterList.currentPage,
        };
        setOrganizations({
          ...organizations,
          filterList: item,
          unFilterList: item,
        });
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
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
    PermissionEnum.organization.name
  ) as UserPermission;
  const hasView = per?.view;
  const hasAdd = per?.add;

  const watchOnClick = async (organization: OrganizationInformation) => {
    const organizationId = organization.id;
    if (organization.status_id == StatusEnum.registration_incomplete) {
      toast.error(t("org_reg_for_uncom"));
      return;
    } else {
      navigate(`/dashboard/organizations/${organizationId}`);
    }
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
                {t("register_organization")}
              </PrimaryButton>
            }
            showDialog={async () => true}
          >
            <AddOrganization onComplete={addItem} />
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
          }}
        />
        <div className="sm:px-4 col-span-3 flex-1 self-start gap-x-3 sm:self-baseline flex justify-end items-center">
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
              sortOnComplete={async (filterName: OrganizationSort) => {
                if (filterName != filters.sort) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filterName);
                  queryParams.set("order", filters.order);
                  queryParams.set("page", filters.page);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(
                    `/dashboard/organizations?${queryParams.toString()}`,
                    {
                      replace: true,
                    }
                  );
                }
              }}
              searchFilterChanged={async (filterName: OrganizationSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filters.order);
                  queryParams.set("page", filters.page);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(
                    `/dashboard/organizations?${queryParams.toString()}`,
                    {
                      replace: true,
                    }
                  );
                }
              }}
              orderOnComplete={async (filterName: Order) => {
                if (filterName != filters.order) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filterName);
                  queryParams.set("page", filters.page);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(
                    `/dashboard/organizations?${queryParams.toString()}`,
                    {
                      replace: true,
                    }
                  );
                }
              }}
              dateOnComplete={(selectedDates: DateObject[]) => {
                if (selectedDates.length == 2) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("order", filters.order);
                  queryParams.set("sort", filters.sort);
                  queryParams.set("page", filters.page);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, selectedDates);
                  navigate(
                    `/dashboard/organizations?${queryParams.toString()}`,
                    {
                      replace: true,
                    }
                  );
                }
              }}
              filtersShowData={{
                sort: [
                  { name: "name", translate: t("name"), onClick: () => {} },
                  {
                    name: "type",
                    translate: t("type"),
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Repeat2
                  className="size-[22px] cursor-pointer text-primary/85 hover:scale-[1.1] transition-transform duration-300 ease-in-out"
                  onClick={refetch}
                />
              </TooltipTrigger>
              <TooltipContent className="rtl:text-3xl-rtl ltr:text-xl-ltr">
                <p>{t("refresh_page")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CustomSelect
          paginationKey={CACHE.ORG_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline"
          updateCache={(data: any) => updateComponentCache(data)}
          getCache={async () =>
            await getComponentCache(CACHE.ORG_TABLE_PAGINATION_COUNT)
          }
          placeholder={`${t("select")}...`}
          emptyPlaceholder={t("no_options_found")}
          rangePlaceholder={t("count")}
          onChange={refetch}
        />
      </div>
      <Table className="bg-card dark:bg-card-secondary rounded-md my-[2px] py-8">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-center w-[60px]">{t("pic")}</TableHead>
            <TableHead className="text-start">{t("registration_no")}</TableHead>
            <TableHead className="text-start">{t("name")}</TableHead>
            <TableHead className="text-start">{t("type")}</TableHead>
            <TableHead className="text-start w-[60px]">{t("status")}</TableHead>
            <TableHead className="text-start">{t("contact")}</TableHead>
            <TableHead className="text-start">{t("email")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {isLoading ? (
            <>{skeleton}</>
          ) : (
            organizations.filterList.data.map(
              (item: OrganizationInformation) => (
                <TableRowIcon
                  read={hasView}
                  remove={false}
                  edit={false}
                  more={true}
                  onEdit={async () => {}}
                  onMore={async () => {}}
                  key={item.name}
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
                  <TableCell className="truncate rtl:text-md-rtl">
                    {item.registration_no}
                  </TableCell>
                  <TableCell className="truncate">{item.name}</TableCell>
                  <TableCell className="truncate">{item.type}</TableCell>
                  <TableCell>
                    <BooleanStatusButton
                      getColor={function (): {
                        style: string;
                        value?: string;
                      } {
                        return StatusEnum.registered === item.status_id
                          ? {
                              style: "border-green-500/90",
                              value: item.status,
                            }
                          : StatusEnum.block == item.status_id
                          ? {
                              style: "border-red-500",
                              value: item.status,
                            }
                          : StatusEnum.registration_incomplete == item.status_id
                          ? {
                              style: "border-blue-500/90",
                              value: item.status,
                            }
                          : {
                              style: "border-orange-500",
                              value: item.status,
                            };
                      }}
                    />
                  </TableCell>
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
              )
            )
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between rounded-md bg-card dark:bg-card-secondary flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${organizations.unFilterList.currentPage} ${t("of")} ${
          organizations.unFilterList.lastPage
        }`}</h1>
        <Pagination
          lastPage={organizations.unFilterList.lastPage}
          onPageChange={async (page) => {
            // await initialize(undefined, undefined, page)
            const queryParams = new URLSearchParams();
            queryParams.set("sort", filters.sort);
            queryParams.set("order", filters.order);
            queryParams.set("sch_col", filters.search.column);
            queryParams.set("sch_val", filters.search.value);
            queryParams.set("page", page.toString());
            setDateToURL(queryParams, filters.date);
            navigate(`/dashboard/organizations?${queryParams.toString()}`, {
              replace: true,
            });
          }}
        />
      </div>
    </>
  );
}
