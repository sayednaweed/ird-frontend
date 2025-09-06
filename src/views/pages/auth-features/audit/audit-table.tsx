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

import Pagination from "@/components/custom-ui/table/Pagination";
import { ListFilter, Search } from "lucide-react";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import SecondaryButton from "@/components/custom-ui/button/SecondaryButton";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import { CACHE } from "@/lib/constants";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import { DateObject } from "react-multi-date-picker";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import { setDateToURL, toLocaleDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Audit, UserPermission } from "@/database/models";
import type { AuditSearch, Order, PaginationData } from "@/lib/types";
import CustomMultiDatePicker from "@/components/custom-ui/datePicker/CustomMultiDatePicker";
import FilterDialog from "@/components/custom-ui/dialog/filter-dialog";
import { useDebounce } from "@/hook/use-debounce";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useGlobalState } from "@/context/GlobalStateContext";
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { PermissionEnum } from "@/database/model-enums";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import AuditDetailsDialog from "@/views/pages/auth-features/audit/parts/audit-details-dialog";
import PrintReport from "@/components/custom-ui/resuseable/print-report";
import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";

export function AuditTable() {
  const { getComponentCache, updateComponentCache } = useCacheDB();
  const start = useDownloadStore((s) => s.startDownload);

  const { user } = useUserAuthState();
  const [state] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [onEdit, setOnEdit] = useState<Audit | undefined>(undefined);
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 500);
  // Accessing individual search filters
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const userType = searchParams.get("usr_t");
  const userId = searchParams.get("usr_id");
  const username = searchParams.get("usrn");
  const event = searchParams.get("evt");
  const table = searchParams.get("tabl");
  const startDate = searchParams.get("st_dt");
  const endDate = searchParams.get("en_dt");
  const order = searchParams.get("order");

  const filters = {
    order: order == null ? "desc" : (order as Order),
    filterBy: {
      userType: {
        name: userType ? userType : undefined,
      },
      user: {
        id: userId ? userId : undefined,
        name: username ? username : undefined,
      },
      event: event ? event : undefined,
      table: {
        name: table ? table : undefined,
      },
    },
    search: {
      column: searchColumn == null ? "user" : searchColumn,
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

  const prepareParams = (
    searchInput: string | undefined,
    dates: {
      startDate: string | null;
      endDate: string | null;
    },
    page?: number | undefined,
    count?: number | undefined
  ) => {
    return {
      page: page,
      per_page: count,
      filters: {
        filterBy: {
          userType: {
            name: filters.filterBy.userType.name,
          },
          user: {
            id: filters.filterBy.user.id,
          },
          event: filters.filterBy.event,
          table: {
            name: filters.filterBy.table.name,
          },
        },
        search: {
          column: filters.search.column,
          value: searchInput,
        },
        date: dates,
      },
    };
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
      const response = await axiosClient.get(`audits`, {
        params: prepareParams(searchInput, dates, page, count),
      });
      const fetch = response.data.audits.data as Audit[];
      const lastPage = response.data.audits.last_page;
      const totalItems = response.data.audits.total;
      const perPage = response.data.audits.per_page;
      const currentPage = response.data.audits.current_page;
      setAudits({
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
  useEffect(() => {
    if (debouncedValue) {
      initialize(debouncedValue, undefined, undefined);
    }
  }, [debouncedValue]);
  const initialize = async (
    searchInput: string | undefined = undefined,
    count: number | undefined,
    page: number | undefined
  ) => {
    if (!count) {
      const countSore = await getComponentCache(
        CACHE.AUDIT_TABLE_PAGINATION_COUNT
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

  const [audits, setAudits] = useState<{
    filterList: PaginationData<Audit>;
    unFilterList: PaginationData<Audit>;
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
  const allowSubmit =
    filters.filterBy.userType.name !== undefined &&
    filters.filterBy.user.id !== undefined &&
    filters.filterBy.event !== undefined &&
    filters.filterBy.table.name !== undefined;

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
    PermissionEnum.audit.name
  ) as UserPermission;
  const hasView = per?.view;
  const watchOnClick = async (audit: Audit) => {
    setOnEdit(audit);
  };
  const viewAuditDialog = onEdit && (
    <NastranModel
      size="lg"
      visible={true}
      isDismissable={false}
      button={undefined}
      showDialog={async () => true}
    >
      <AuditDetailsDialog
        audit={onEdit}
        onClose={function (): void {
          setOnEdit(undefined);
        }}
      />
    </NastranModel>
  );
  const printPdf = () => {
    // 1. Validate
    if (audits.filterList.data.length == 0) {
      toast.error(t("no_item"));
      return;
    }
    let dates = {
      startDate: startDate,
      endDate: endDate,
    };
    start({
      id: crypto.randomUUID(),
      filename: `${t("reports")}.pdf`,
      url: `audits/generate/pdf-report`,
      params: prepareParams(filters.search.value, dates),
    });
  };
  const printExcel = () => {
    // 1. Validate
    if (audits.filterList.data.length == 0) {
      toast.error(t("no_item"));
      return;
    }
    let dates = {
      startDate: startDate,
      endDate: endDate,
    };
    start({
      id: crypto.randomUUID(),
      filename: `${t("reports")}.xlsx`,
      url: `audits/generate/excel-report`,
      params: prepareParams(filters.search.value, dates),
    });
  };
  return (
    <div className="grid xl:grid-cols-[1fr_300px] gap-4 pb-16">
      {viewAuditDialog}
      <div className="grid grid-cols-1 xxl:grid-cols-2 sm:grid-cols-3 gap-4 place-content-baseline xl:grid-cols-1 bg-card rounded-md p-4 border">
        <APICombobox
          lable={t("type")}
          className="capitalize"
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) => {
            const queryParams = new URLSearchParams();
            queryParams.set("sch_col", filters.search.column);
            queryParams.set("sch_val", filters.search.value);
            queryParams.set("usr_t", selection?.name);
            if (filters.filterBy.user.id)
              queryParams.set("usr_id", filters.filterBy.user.id);
            if (filters.filterBy.user.name)
              queryParams.set("usrn", filters.filterBy.user.name);
            if (filters.filterBy.event)
              queryParams.set("evt", filters.filterBy.event);
            if (filters.filterBy.table.name)
              queryParams.set("tabl", filters.filterBy.table.name);
            setDateToURL(queryParams, filters.date);
            navigate(`/dashboard/audit?${queryParams.toString()}`, {
              replace: true,
            });
          }}
          cacheData={false}
          selectedItem={filters.filterBy.userType.name}
          placeHolder={t("select")}
          apiUrl={"audits/users/type"}
          mode="single"
        />

        <APICombobox
          lable={t("user")}
          readonly={filters.filterBy.userType.name == undefined}
          key={filters.filterBy.userType.name}
          className="capitalize"
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) => {
            const queryParams = new URLSearchParams();
            queryParams.set("sch_col", filters.search.column);
            queryParams.set("sch_val", filters.search.value);
            if (filters.filterBy.userType.name)
              queryParams.set("usr_t", filters.filterBy.userType.name);
            queryParams.set("usr_id", selection.id);
            queryParams.set("usrn", selection.name);
            if (filters.filterBy.event)
              queryParams.set("evt", filters.filterBy.event);
            if (filters.filterBy.table.name)
              queryParams.set("tabl", filters.filterBy.table.name);
            setDateToURL(queryParams, filters.date);
            navigate(`/dashboard/audit?${queryParams.toString()}`, {
              replace: true,
            });
          }}
          selectedItem={filters.filterBy.user?.name}
          placeHolder={t("select")}
          apiUrl={"audits/users"}
          mode="single"
          params={{
            user_type: filters.filterBy.userType.name,
          }}
          cacheData={false}
        />

        <APICombobox
          key={filters.filterBy.user?.id}
          readonly={filters.filterBy.user.id == undefined}
          lable={t("table")}
          className="capitalize"
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) => {
            const queryParams = new URLSearchParams();
            queryParams.set("sch_col", filters.search.column);
            queryParams.set("sch_val", filters.search.value);
            if (filters.filterBy.userType.name)
              queryParams.set("usr_t", filters.filterBy.userType.name);
            if (filters.filterBy.user.id)
              queryParams.set("usr_id", filters.filterBy.user.id);
            if (filters.filterBy.user.name)
              queryParams.set("usrn", filters.filterBy.user.name);
            if (filters.filterBy.event)
              queryParams.set("evt", filters.filterBy.event);
            queryParams.set("tabl", selection?.name);
            setDateToURL(queryParams, filters.date);
            navigate(`/dashboard/audit?${queryParams.toString()}`, {
              replace: true,
            });
          }}
          selectedItem={filters.filterBy.table.name}
          placeHolder={t("select")}
          apiUrl={"audits/tables"}
          mode="single"
          cacheData={false}
          params={{
            id: filters.filterBy.user?.id,
            user_type: filters.filterBy.userType?.name,
          }}
        />
        <APICombobox
          readonly={filters.filterBy.table.name == undefined}
          lable={t("event")}
          className="capitalize"
          placeholderText={t("search_item")}
          errorText={t("no_item")}
          onSelect={(selection: any) => {
            const queryParams = new URLSearchParams();
            queryParams.set("sch_col", filters.search.column);
            queryParams.set("sch_val", filters.search.value);
            if (filters.filterBy.userType.name)
              queryParams.set("usr_t", filters.filterBy.userType.name);
            if (filters.filterBy.user.id)
              queryParams.set("usr_id", filters.filterBy.user.id);
            if (filters.filterBy.user.name)
              queryParams.set("usrn", filters.filterBy.user.name);
            if (filters.filterBy.table.name)
              queryParams.set("tabl", filters.filterBy.table.name);
            queryParams.set("evt", selection?.name);
            setDateToURL(queryParams, filters.date);
            navigate(`/dashboard/audit?${queryParams.toString()}`, {
              replace: true,
            });
          }}
          selectedItem={filters.filterBy.event}
          placeHolder={t("select")}
          apiUrl={"audits/events"}
          mode="single"
          cacheData={false}
        />

        <div>
          <h1 className="rtl:text-xl-rtl ltr:text-lg-ltr px-1 font-semibold">
            {t("date")}
          </h1>
          <CustomMultiDatePicker
            dateOnComplete={(selectedDates: DateObject[]) => {
              if (selectedDates.length == 2) {
                const queryParams = new URLSearchParams();
                queryParams.set("sch_col", filters.search.column);
                queryParams.set("sch_val", filters.search.value);
                if (filters.filterBy.userType.name)
                  queryParams.set("usr_t", filters.filterBy.userType.name);
                if (filters.filterBy.user.id)
                  queryParams.set("usr_id", filters.filterBy.user.id);
                if (filters.filterBy.user.name)
                  queryParams.set("usrn", filters.filterBy.user.name);
                if (filters.filterBy.table.name)
                  queryParams.set("tabl", filters.filterBy.table.name);
                if (filters.filterBy.event)
                  queryParams.set("evt", filters.filterBy.event);
                setDateToURL(queryParams, selectedDates);
                navigate(`/dashboard/audit?${queryParams.toString()}`, {
                  replace: true,
                });
              }
            }}
            value={filters.date}
            className="py-[13px] bg-card hover:shadow-sm cursor-pointer mt-2"
          />
        </div>

        <PrimaryButton
          className=" col-span-full"
          onClick={() => initialize(undefined, undefined, undefined)}
          disabled={loading || !allowSubmit}
        >
          <ButtonSpinner loading={loading}>{t("search")}</ButtonSpinner>
        </PrimaryButton>
      </div>

      <section className=" xl:-order-1 overflow-x-auto">
        <div className="grid grid-cols-[auto_auto_auto] sm:grid-cols-[1fr_auto_auto_auto] items-center sm:items-baseline rounded-md bg-card gap-2 px-2 py-2">
          <CustomInput
            size_="lg"
            placeholder={`${t(filters.search.column)}...`}
            type="text"
            parentClassName="w-full sm:w-[300px] md:w-[440px] col-span-full sm:col-span-1"
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
              searchFilterChanged={async (filterName: AuditSearch) => {
                if (filterName != filters.search.column) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  if (filters.filterBy.userType.name)
                    queryParams.set("usr_t", filters.filterBy.userType.name);
                  if (filters.filterBy.user.id)
                    queryParams.set("usr_id", filters.filterBy.user.id);
                  if (filters.filterBy.user.name)
                    queryParams.set("usrn", filters.filterBy.user.name);
                  if (filters.filterBy.table.name)
                    queryParams.set("tabl", filters.filterBy.table.name);
                  if (filters.filterBy.event)
                    queryParams.set("evt", filters.filterBy.event);
                  setDateToURL(queryParams, filters.date);
                  queryParams.set("order", filters.order);
                  queryParams.set("sch_col", filterName);
                  queryParams.set("sch_val", filters.search.value);
                  navigate(`/dashboard/audit?${queryParams.toString()}`, {
                    replace: true,
                  });
                }
              }}
              orderOnComplete={async (filterName: Order) => {
                if (filterName != filters.order) {
                  const queryParams = new URLSearchParams();
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  if (filters.filterBy.userType.name)
                    queryParams.set("usr_t", filters.filterBy.userType.name);
                  if (filters.filterBy.user.id)
                    queryParams.set("usr_id", filters.filterBy.user.id);
                  if (filters.filterBy.user.name)
                    queryParams.set("usrn", filters.filterBy.user.name);
                  if (filters.filterBy.table.name)
                    queryParams.set("tabl", filters.filterBy.table.name);
                  if (filters.filterBy.event)
                    queryParams.set("evt", filters.filterBy.event);
                  setDateToURL(queryParams, filters.date);
                  queryParams.set("order", filterName);
                  queryParams.set("sch_col", filters.search.column);
                  queryParams.set("sch_val", filters.search.value);
                  navigate(`/dashboard/audit?${queryParams.toString()}`, {
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
                    name: "user",
                    translate: t("user"),
                    onClick: () => {},
                  },
                  {
                    name: "event",
                    translate: t("event"),
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
          <CustomSelect
            paginationKey={CACHE.AUDIT_TABLE_PAGINATION_COUNT}
            options={[
              { value: "10", label: "10" },
              { value: "20", label: "20" },
              { value: "50", label: "50" },
            ]}
            className="w-fit sm:self-baseline"
            updateCache={updateComponentCache}
            getCache={async () =>
              await getComponentCache(CACHE.AUDIT_TABLE_PAGINATION_COUNT)
            }
            placeholder={`${t("select")}...`}
            emptyPlaceholder={t("no_options_found")}
            rangePlaceholder={t("count")}
            onChange={async (value: string) =>
              await initialize(undefined, parseInt(value), undefined)
            }
          />
          <PrintReport
            onGeneratePdfClick={printPdf}
            onGenerateExcelClick={printExcel}
            className="sm:ltr:mr-3 sm:rtl:ml-3 self-center mt-2 size-5"
          />
        </div>
        <Table className="min-w-max bg-card rounded-md my-[2px] py-8">
          <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-start">{t("user")}</TableHead>
              <TableHead className="text-start">{t("table")}</TableHead>
              <TableHead className="text-start">{t("auditable_id")}</TableHead>
              <TableHead className="text-start">{t("event")}</TableHead>
              <TableHead className="text-start">{t("uri")}</TableHead>
              <TableHead className="text-start">{t("ip_address")}</TableHead>
              <TableHead className="text-start">{t("date")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
            {loading ? (
              <>{skeleton}</>
            ) : (
              audits.filterList.data.map((item: Audit) => (
                <TableRowIcon
                  read={hasView}
                  edit={false}
                  onEdit={async () => {}}
                  key={item.id}
                  item={item}
                  onRemove={async () => {}}
                  onRead={watchOnClick}
                >
                  <TableCell className="rtl:text-md-rtl truncate">
                    {item.user_type}
                  </TableCell>
                  <TableCell className="rtl:text-md-rtl truncate">
                    {item.table}
                  </TableCell>
                  <TableCell className="rtl:text-md-rtl truncate">
                    {item.auditable_id}
                  </TableCell>
                  <TableCell className="rtl:text-md-rtl truncate">
                    {item.event}
                  </TableCell>
                  <TableCell className="rtl:text-md-rtl truncate">
                    {item.url}
                  </TableCell>
                  <TableCell className="rtl:text-md-rtl truncate">
                    {item.ip_address}
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
          )} ${audits.unFilterList.currentPage} ${t("of")} ${
            audits.unFilterList.lastPage
          } / ${t("total")} ${audits.filterList.totalItems}`}</h1>
          <Pagination
            lastPage={audits.unFilterList.lastPage}
            onPageChange={async (page) => {
              await initialize(undefined, undefined, page);
            }}
          />
        </div>
      </section>
    </div>
  );
}
