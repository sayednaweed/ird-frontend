import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useParams } from "react-router";
import { DateObject } from "react-multi-date-picker";
import { isStartDateBigger, isString } from "@/lib/utils";
import type { BasicModel, CenterBudget } from "@/database/models";
import { toast } from "sonner";
import type { ValidateItem } from "@/validation/types";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
import CenterBudgetTable from "@/views/pages/auth-features/projects/add/steps/parts/center-budget-table";
interface EditProjectInformation {
  start_date: DateObject;
  end_date: DateObject;
  donor: BasicModel;
  donor_register_no: string;
  currency: BasicModel;
  budget: number;
  centers_list: CenterBudget[];
  optional_lang: string;
}
interface EditCenterBudgetTabProps {
  hasEdit: boolean;
}
export default function EditCenterBudgetTab(props: EditCenterBudgetTabProps) {
  const { hasEdit } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const [userData, setUserData] = useState<EditProjectInformation | any>();

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`projects/budget/${id}`);
      if (response.status == 200) {
        setUserData(response.data);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
      setFailed(true);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadInformation();
  }, []);

  const saveData = async () => {
    if (loading || id === undefined) {
      setLoading(false);
      return;
    }
    setLoading(true);
    // 2. Validate form
    const compulsoryFields: ValidateItem[] = [
      {
        name: "start_date",
        rules: ["required"],
      },
      {
        name: "end_date",
        rules: ["required"],
      },
      {
        name: "donor",
        rules: ["required"],
      },
      {
        name: "donor_register_no",
        rules: ["required"],
      },
      {
        name: "currency",
        rules: ["required"],
      },
      {
        name: "budget",
        rules: ["required"],
      },
      {
        name: "centers_list",
        rules: [
          (userData: any) => {
            if (Array.isArray(userData?.centers_list)) {
              if (userData.centers_list.length >= 1) return false;
            }
            toast.error(t("must_be_one_center"));
            return true;
          },
        ],
      },
    ];
    const passed = await validate(compulsoryFields, userData, setError);
    if (!passed) {
      setLoading(false);
      return;
    }

    const content = {
      ...userData, // shallow copy of the userData object
      centers_list: userData.centers_list,
      start_date: !isString(userData?.start_date)
        ? userData?.start_date?.toDate()?.toISOString()
        : userData?.start_date,
      end_date: !isString(userData?.end_date)
        ? userData?.end_date?.toDate()?.toISOString()
        : userData?.end_date,
    };
    // 2. Store
    try {
      const response = await axiosClient.put("projects/budget", {
        content: JSON.stringify(content),
        id: id,
      });
      if (response.status == 200) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData((prev: any) => ({ ...prev, [name]: value }));
  };
  console.log(userData?.currency);
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_information")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("edit_descr")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : userData === undefined ? (
          <NastranSpinner />
        ) : (
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
            {userData?.budget && (
              <CenterBudgetTable
                userData={userData}
                setUserData={setUserData}
              />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        {failed ? (
          <PrimaryButton
            onClick={async () => await loadInformation()}
            className="bg-red-500 hover:bg-red-500/70"
          >
            {t("failed_retry")}
            <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
          </PrimaryButton>
        ) : (
          userData &&
          hasEdit && (
            <PrimaryButton onClick={saveData} className={`shadow-lg`}>
              <ButtonSpinner loading={loading}>{t("update")}</ButtonSpinner>
            </PrimaryButton>
          )
        )}
      </CardFooter>
    </Card>
  );
}
