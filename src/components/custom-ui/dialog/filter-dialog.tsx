import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import { useTranslation } from "react-i18next";

import CustomMultiDatePicker from "@/components/custom-ui/datePicker/CustomMultiDatePicker";
import { DateObject } from "react-multi-date-picker";
import type { Order } from "@/lib/types";
import {
  FilterItem,
  type IShowData,
} from "@/components/custom-ui/dialog/FilterItem";
export interface FilterDialogProps {
  sortOnComplete: (itemName: any) => void;
  searchFilterChanged: (itemName: any) => void;
  orderOnComplete: (itemName: any) => void;
  dateOnComplete: (selectedDates: DateObject[]) => void;
  filters: any;
  filtersShowData: {
    sort?: IShowData[];
    order?: IShowData[];
    search?: IShowData[];
  };
  showColumns: {
    sort: boolean;
    order: boolean;
    search: boolean;
    date: boolean;
  };
}
export default function FilterDialog(props: FilterDialogProps) {
  const {
    sortOnComplete,
    searchFilterChanged,
    orderOnComplete,
    dateOnComplete,
    filters,
    filtersShowData,
    showColumns,
  } = props;
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();
  const handleSort = (itemName: string) => {
    sortOnComplete(itemName);
    modelOnRequestHide();
  };
  const handleSearch = (itemName: string) => {
    searchFilterChanged(itemName);
    modelOnRequestHide();
  };
  const handleOrder = (itemName: string) => {
    orderOnComplete(itemName as Order);
    modelOnRequestHide();
  };
  const handleDate = (selectedDates: DateObject[]) => {
    dateOnComplete(selectedDates);
    if (selectedDates.length == 2) modelOnRequestHide();
  };

  const sorts = showColumns.sort
    ? filtersShowData.sort?.map((option: IShowData) => ({
        ...option,
        onClick: handleSort, // Adding new 'label' field
      }))
    : [];
  const orders = showColumns.order
    ? filtersShowData.order?.map((option: IShowData) => ({
        ...option,
        onClick: handleOrder, // Adding new 'label' field
      }))
    : [];
  const searchs = showColumns.search
    ? filtersShowData.search?.map((option: IShowData) => ({
        ...option,
        onClick: handleSearch, // Adding new 'label' field
      }))
    : [];

  return (
    <Card className="w-fit self-center [backdrop-filter:blur(20px)] bg-white/70 dark:!bg-black/40">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-lg-ltr text-tertiary">
          {t("search_filters")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:flex sm:flex-row gap-x-4 pb-12">
        {showColumns.sort && (
          <FilterItem
            selected={filters.sort}
            headerName={t("sort_by")}
            items={sorts ? sorts : []}
          />
        )}

        {showColumns.date && (
          <section className="min-w-[120px] space-y-2">
            <h1
              className={
                "uppercase text-start font-semibold border-b border-primary/20 pb-2 rtl:text-2xl-rtl ltr:text-lg-ltr text-primary"
              }
            >
              {t("date")}
            </h1>
            <CustomMultiDatePicker
              value={filters.date}
              dateOnComplete={handleDate}
            />
          </section>
        )}
        {showColumns.order && (
          <FilterItem
            selected={filters.order}
            headerName={t("order")}
            items={orders ? orders : []}
          />
        )}
        {showColumns.search && (
          <FilterItem
            selected={filters.search.column}
            headerName={t("search")}
            items={searchs ? searchs : []}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          className="rtl:text-2xl-rtl ltr:text-lg-ltr"
          onClick={modelOnRequestHide}
        >
          {t("cancel")}
        </Button>
      </CardFooter>
    </Card>
  );
}
