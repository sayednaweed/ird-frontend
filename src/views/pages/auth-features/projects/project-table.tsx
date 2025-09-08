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
import { setDateToURL, toLocaleDate } from "@/lib/utils";
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
import { useGlobalState } from "@/context/GlobalStateContext";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import type {
  Order,
  PaginationData,
  ProjectSearch,
  ProjectSort,
} from "@/lib/types";
import { CACHE } from "@/lib/constants";
import type { Projects, UserPermission } from "@/database/models";
import { useDatasource } from "@/hook/use-datasource";
import { toast } from "sonner";
import { PermissionEnum, RoleEnum, StatusEnum } from "@/database/model-enums";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { useDebounce } from "@/hook/use-debounce";

export function ProjectTable() {
  const { user } = useGeneralAuthState();
  const navigate = useNavigate();
  const [state] = useGlobalState();
  const { updateComponentCache, getComponentCache } = useCacheDB();

  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const sort = searchParams.get("sort");
  const order = searchParams.get("order");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const page = searchParams.get("page");
  const [inputValue, setInputValue] = useState(searchValue);
  const debouncedValue = useDebounce(inputValue, 500);
  const filters = {
    sort: sort == null ? "registration_no" : (sort as ProjectSort),
    page: page == null ? "1" : page,
    order: order == null ? "desc" : (order as Order),
    search: {
      column:
        searchColumn == null
          ? "registration_no"
          : (searchColumn as ProjectSearch),
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
  const loadList = async () => {
    const countSore = await getComponentCache(
      CACHE.PROJECT_TABLE_PAGINATION_COUNT
    );
    const count = countSore?.value ? countSore.value : 10;
    // 1. Organize date
    let dates = {
      startDate: startDate,
      endDate: endDate,
    };
    // 2. Send data
    const url =
      user.role.role == RoleEnum.organization ? "projects-org" : "projects";
    const response = await axiosClient.get(url, {
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
    const fetch = response.data.projects.data as Projects[];
    const lastPage = response.data.projects.last_page;
    const totalItems = response.data.projects.total;
    const perPage = response.data.projects.per_page;
    const currentPage = response.data.projects.current_page;

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
  const { projects, setProjects, isLoading, refetch } = useDatasource<
    {
      filterList: PaginationData<Projects>;
      unFilterList: PaginationData<Projects>;
    },
    "projects"
  >(
    {
      queryFn: loadList,
      queryKey: "projects",
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
      navigate(`/dashboard/projects?${queryParams.toString()}`, {
        replace: true,
      });
    }
  }, [debouncedValue]);
  const { t } = useTranslation();

  const deleteOnClick = async (project: Projects) => {
    try {
      const itemId = project.id;
      const response = await axiosClient.delete("projects/" + itemId);
      if (response.status == 200) {
        const filtered = projects.unFilterList.data.filter(
          (item: Projects) => itemId != item?.id
        );
        const item = {
          data: filtered,
          lastPage: projects.unFilterList.lastPage,
          totalItems: projects.unFilterList.totalItems,
          perPage: projects.unFilterList.perPage,
          currentPage: projects.unFilterList.currentPage,
        };
        setProjects({ ...projects, filterList: item, unFilterList: item });
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
      <TableCell>
        <Shimmer className="h-[24px] w-full rounded-sm" />
      </TableCell>
    </TableRow>
  );
  const per: UserPermission = user?.permissions.get(
    PermissionEnum.projects.name
  ) as UserPermission;
  const hasView = per?.view;
  const hasAdd = per?.add;

  const watchOnClick = async (projects: Projects) => {
    const itemId = projects.id;
    navigate(`/dashboard/projects/details/${itemId}`);
  };
  return (
    <>
      <div className="flex flex-col sm:items-baseline sm:flex-row rounded-md bg-card dark:!bg-black/30 gap-2 flex-1 px-2 py-2 mt-4">
        {hasAdd && user.role.role == RoleEnum.organization && (
          <PrimaryButton
            onClick={() => navigate(`/dashboard/projects/${user.id}`)}
            className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr"
          >
            {t("register_project")}
          </PrimaryButton>
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
              sortOnComplete={async (filterName: ProjectSort) => {
                if (filterName != filters.sort) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filterName);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/dashboard/projects?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              searchFilterChanged={async (filterName: ProjectSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sort", filters.sort);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  setDateToURL(queryParams, filters.date);
                  navigate(`/dashboard/projects?${queryParams.toString()}`, {
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
                  navigate(`/dashboard/projects?${queryParams.toString()}`, {
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
                  navigate(`/dashboard/projects?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              filtersShowData={{
                sort: [
                  {
                    name: "registration_no",
                    translate: t("registration_no"),
                    onClick: () => {},
                  },
                  {
                    name: "project_name",
                    translate: t("project_name"),
                    onClick: () => {},
                  },
                  {
                    name: "donor",
                    translate: t("donor"),
                    onClick: () => {},
                  },
                  {
                    name: "status",
                    translate: t("status"),
                    onClick: () => {},
                  },
                  {
                    name: "currency",
                    translate: t("currency"),
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
                  {
                    name: "project_name",
                    translate: t("project_name"),
                    onClick: () => {},
                  },
                  { name: "donor", translate: t("donor"), onClick: () => {} },
                  {
                    name: "budget",
                    translate: t("budget"),
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
          paginationKey={CACHE.PROJECT_TABLE_PAGINATION_COUNT}
          options={[
            { value: "10", label: "10" },
            { value: "20", label: "20" },
            { value: "50", label: "50" },
          ]}
          className="w-fit sm:self-baseline"
          updateCache={(data: any) => updateComponentCache(data)}
          getCache={async () =>
            await getComponentCache(CACHE.PROJECT_TABLE_PAGINATION_COUNT)
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
            <TableHead className="text-start">{t("project_name")}</TableHead>
            <TableHead className="text-start">{t("donor")}</TableHead>
            <TableHead className="text-start">{t("budget")}</TableHead>
            <TableHead className="text-start">{t("currency")}</TableHead>
            <TableHead className="text-start">{t("start_date")}</TableHead>
            <TableHead className="text-start">{t("end_date")}</TableHead>
            <TableHead className="text-start">{t("status")}</TableHead>
            <TableHead className="text-start">{t("date")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {isLoading ? (
            <>{skeleton}</>
          ) : (
            projects.filterList.data.map((item: Projects) => (
              <TableRowIcon
                read={hasView}
                remove={false}
                edit={false}
                onEdit={async () => {}}
                key={item.id}
                item={item}
                onRemove={deleteOnClick}
                onRead={watchOnClick}
              >
                <TableCell className="truncate">{item.project_name}</TableCell>
                <TableCell className="truncate">{item.donor}</TableCell>
                <TableCell className="truncate">{item.budget}</TableCell>
                <TableCell className="truncate">{item.currency}</TableCell>
                <TableCell className="truncate">
                  {toLocaleDate(new Date(item.start_date), state)}
                </TableCell>
                <TableCell className="truncate">
                  {toLocaleDate(new Date(item.end_date), state)}
                </TableCell>
                <TableCell>
                  <BooleanStatusButton
                    className=" mx-0"
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

                <TableCell className="truncate">
                  {toLocaleDate(new Date(item.created_at), state)}
                </TableCell>
              </TableRowIcon>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-between rounded-md bg-card dark:bg-card-secondary flex-1 p-3 items-center">
        <h1 className="rtl:text-lg-rtl ltr:text-md-ltr font-medium">{`${t(
          "page"
        )} ${projects.unFilterList.currentPage} ${t("of")} ${
          projects.unFilterList.lastPage
        }`}</h1>
        <Pagination
          lastPage={projects.unFilterList.lastPage}
          onPageChange={async (page) => {
            // await initialize(undefined, undefined, page)
            const queryParams = new URLSearchParams();
            queryParams.set("sort", filters.sort);
            queryParams.set("order", filters.order);
            queryParams.set("sch_col", filters.search.column);
            queryParams.set("sch_val", filters.search.value);
            queryParams.set("page", page.toString());
            setDateToURL(queryParams, filters.date);
            navigate(`/dashboard/projects?${queryParams.toString()}`, {
              replace: true,
            });
          }}
        />
      </div>
    </>
  );
}
