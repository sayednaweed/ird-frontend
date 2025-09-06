import { useContext } from "react";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { useTranslation } from "react-i18next";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import { DateObject } from "react-multi-date-picker";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CenterBudgetTable from "./parts/center-budget-table";
import { useScrollToElement } from "@/hook/use-scroll-to-element";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
import { isStartDateBigger } from "@/lib/utils";

export default function AddCenterBudget() {
  const { userData, setUserData, error } = useContext(StepperContext);
  useScrollToElement(error);

  const { t } = useTranslation();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-x-4 xl:gap-x-12 lg:items-baseline mt-4 gap-y-3 w-full lg:w-full">
      <CustomDatePicker
        placeholder={t("select_a_date")}
        lable={t("start_date")}
        requiredHint={`* ${t("required")}`}
        required={true}
        value={userData.start_date}
        dateOnComplete={(date: DateObject) => {
          if (
            isStartDateBigger(
              date,
              userData?.end_date,
              t("end_date_must_bigger")
            )
          )
            return true;
          setUserData((prev: any) => ({
            ...prev,
            start_date: date,
          }));
        }}
        className="py-3 w-full"
        errorMessage={error.get("start_date")}
        bottom={true}
      />
      <CustomDatePicker
        placeholder={t("select_a_date")}
        lable={t("end_date")}
        requiredHint={`* ${t("required")}`}
        required={true}
        value={userData.end_date}
        dateOnComplete={(date: DateObject) => {
          if (
            isStartDateBigger(
              userData?.start_date,
              date,
              t("end_date_must_bigger")
            )
          )
            return true;

          setUserData((prev: any) => ({
            ...prev,
            end_date: date,
          }));
        }}
        className="py-3 w-full"
        errorMessage={error.get("end_date")}
        bottom={true}
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData((prev: any) => ({
            ...prev,
            ["donor"]: selection,
          }))
        }
        lable={t("donor")}
        required={true}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["donor"]?.name}
        placeHolder={t("select_a")}
        errorMessage={error.get("donor")}
        apiUrl={"donors/names/list"}
        mode="single"
        cacheData={false}
      />
      <CustomInput
        required={true}
        requiredHint={`* ${t("required")}`}
        size_="sm"
        label={t("donor_register_no")}
        name="donor_register_no"
        defaultValue={userData["donor_register_no"]}
        placeholder={t("enter")}
        type="text"
        errorMessage={error.get("donor_register_no")}
        onBlur={handleChange}
      />
      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData((prev: any) => ({
            ...prev,
            ["currency"]: selection,
          }))
        }
        lable={t("currency")}
        required={true}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["currency"]?.name}
        placeHolder={t("select_a")}
        errorMessage={error.get("currency")}
        apiUrl={"currencies"}
        mode="single"
        cacheData={false}
      />
      <CustomInput
        endContent={
          <h1 className="flex justify-center items-center rounded border border-primary/50 size-[18px]">
            {userData?.currency?.symbol}
          </h1>
        }
        required={true}
        requiredHint={`* ${t("required")}`}
        size_="sm"
        label={t("budget")}
        name="budget"
        value={userData["budget"] || ""}
        placeholder={t("enter")}
        type="text"
        errorMessage={error.get("budget")}
        onChange={handleChange}
      />
      {userData?.budget && <CenterBudgetTable />}
    </div>
  );
}
