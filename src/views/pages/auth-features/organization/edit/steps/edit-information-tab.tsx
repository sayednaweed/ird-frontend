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
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import { DateObject } from "react-multi-date-picker";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import { isString } from "@/lib/utils";
import type { BasicModel, UserPermission } from "@/database/models";
import { toast } from "sonner";
import type { ValidateItem } from "@/validation/types";
import { CountryEnum, PermissionEnum } from "@/database/model-enums";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
interface EditOrganizationInformation {
  registration_no: string;
  name_english: string | undefined;
  name_pashto: string;
  name_farsi: string;
  area_english: string;
  area_pashto: string;
  area_farsi: string;
  abbr: string;
  type: BasicModel;
  contact: string;
  email: string;
  moe_registration_no: string;
  country: BasicModel;
  province: BasicModel;
  district: BasicModel;
  establishment_date: DateObject;
  optional_lang: string;
}
interface EditInformationTabProps {
  permissions: UserPermission;
  registerationExpired: boolean;
}
export default function EditInformationTab(props: EditInformationTabProps) {
  const { permissions, registerationExpired } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const [organizationData, setOrganizationData] =
    useState<EditOrganizationInformation>();

  const loadInformation = async () => {
    try {
      const response = await axiosClient.get(`organizations/details/${id}`);
      if (response.status == 200) {
        const organization = response.data.organization;
        if (organization) setOrganizationData(organization);
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
    // 1. Validate data changes
    // 2. Validate form
    const compulsoryFields: ValidateItem[] = [
      { name: "name_english", rules: ["required", "max:128", "min:5"] },
      { name: "name_farsi", rules: ["required", "max:128", "min:5"] },
      { name: "name_pashto", rules: ["required", "max:128", "min:5"] },
      { name: "abbr", rules: ["required"] },
      { name: "type", rules: ["required"] },
      { name: "contact", rules: ["required"] },
      { name: "email", rules: ["required"] },
      { name: "moe_registration_no", rules: ["required"] },
      { name: "country", rules: ["required"] },
      { name: "establishment_date", rules: ["required"] },
      { name: "province", rules: ["required"] },
      { name: "district", rules: ["required"] },
      { name: "area_english", rules: ["required", "max:128", "min:5"] },
      { name: "area_pashto", rules: ["required", "max:128", "min:5"] },
      { name: "area_farsi", rules: ["required", "max:128", "min:5"] },
    ];
    const passed = await validate(compulsoryFields, organizationData, setError);
    if (!passed) {
      setLoading(false);
      return;
    }
    const content = {
      ...organizationData, // shallow copy of the userData object
      establishment_date: !isString(organizationData!.establishment_date)
        ? organizationData!.establishment_date?.toDate()?.toISOString()
        : organizationData!.establishment_date,
    };
    // 2. Store
    const formData = new FormData();
    formData.append("id", id);
    formData.append("contents", JSON.stringify(content));
    try {
      const response = await axiosClient.post(
        "organizations/details",
        formData
      );
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

  const information = permissions.sub.get(
    PermissionEnum.organization.sub.information
  );
  const hasEdit = information?.edit;

  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_information")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_user_acc_info")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : organizationData === undefined ? (
          <NastranSpinner />
        ) : (
          <div className="grid gap-x-4 gap-y-6 w-full xl:w-1/2">
            <BorderContainer
              title={t("organization_name")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabInput
                readOnly={!hasEdit}
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setOrganizationData({
                    ...organizationData,
                    [key]: tabName,
                    optional_lang: tabName,
                  });
                }}
                onChanged={(value: string, name: string) => {
                  setOrganizationData({
                    ...organizationData,
                    [name]: value,
                  });
                }}
                name="name"
                highlightColor="bg-tertiary"
                userData={organizationData}
                errorData={error}
                placeholder={t("content")}
                className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0"
                tabsClassName="gap-x-5 px-3"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabInput>
            </BorderContainer>

            <CustomInput
              readOnly={!hasEdit}
              required={true}
              requiredHint={`* ${t("required")}`}
              size_="sm"
              label={t("abbr")}
              name="abbr"
              defaultValue={organizationData["abbr"]}
              placeholder={t("abbr_english")}
              type="text"
              className="uppercase"
              errorMessage={error.get("abbr")}
              onBlur={(e: any) => {
                const { name, value } = e.target;
                setOrganizationData({ ...organizationData, [name]: value });
              }}
            />
            <APICombobox
              placeholderText={t("search_item")}
              errorText={t("no_item")}
              onSelect={(selection: any) =>
                setOrganizationData({
                  ...organizationData,
                  ["type"]: selection,
                })
              }
              lable={t("type")}
              required={true}
              requiredHint={`* ${t("required")}`}
              selectedItem={organizationData["type"]?.name}
              placeHolder={t("select_a")}
              errorMessage={error.get("type")}
              apiUrl={"organization-types"}
              mode="single"
              readonly={!hasEdit}
            />
            <CustomInput
              size_="sm"
              dir="ltr"
              required={true}
              requiredHint={`* ${t("required")}`}
              className="rtl:text-end"
              label={t("contact")}
              placeholder={t("enter_ur_pho_num")}
              defaultValue={organizationData["contact"]}
              type="text"
              name="contact"
              errorMessage={error.get("contact")}
              onChange={(e: any) => {
                const { name, value } = e.target;
                setOrganizationData({ ...organizationData, [name]: value });
              }}
              readOnly={!hasEdit}
            />
            <CustomInput
              size_="sm"
              name="email"
              required={true}
              requiredHint={`* ${t("required")}`}
              label={t("email")}
              defaultValue={organizationData["email"]}
              placeholder={t("enter_your_email")}
              type="email"
              errorMessage={error.get("email")}
              onChange={(e: any) => {
                const { name, value } = e.target;
                setOrganizationData({ ...organizationData, [name]: value });
              }}
              dir="ltr"
              className="rtl:text-right"
              readOnly={!hasEdit}
            />

            <CustomInput
              size_="sm"
              name="moe_registration_no"
              required={true}
              requiredHint={`* ${t("required")}`}
              label={t("moe_registration_no")}
              defaultValue={organizationData["moe_registration_no"]}
              placeholder={t("enter_your_email")}
              type="moe_registration_no"
              errorMessage={error.get("moe_registration_no")}
              onChange={(e: any) => {
                const { name, value } = e.target;
                setOrganizationData({ ...organizationData, [name]: value });
              }}
              dir="ltr"
              className="rtl:text-right"
              readOnly={!hasEdit}
            />

            <BorderContainer
              title={t("place_of_establishment")}
              required={true}
              parentClassName="mt-3"
              className="flex flex-col items-stretch gap-y-3"
            >
              <APICombobox
                placeholderText={t("search_item")}
                errorText={t("no_item")}
                onSelect={(selection: any) =>
                  setOrganizationData({
                    ...organizationData,
                    ["country"]: selection,
                  })
                }
                lable={t("country")}
                required={true}
                selectedItem={organizationData["country"]?.name}
                placeHolder={t("select_a")}
                errorMessage={error.get("country")}
                apiUrl={"countries"}
                mode="single"
                readonly={!hasEdit}
              />
              <CustomDatePicker
                placeholder={t("select_a_date")}
                lable={t("establishment_date")}
                requiredHint={`* ${t("required")}`}
                required={true}
                value={organizationData.establishment_date}
                dateOnComplete={(date: DateObject) => {
                  setOrganizationData({
                    ...organizationData,
                    establishment_date: date,
                  });
                }}
                className="py-3 w-full"
                errorMessage={error.get("establishment_date")}
                readonly={!hasEdit}
              />
            </BorderContainer>

            <BorderContainer
              title={t("head_office_add")}
              required={true}
              parentClassName="mt-3"
              className="flex flex-col items-start gap-y-3"
            >
              <APICombobox
                placeholderText={t("search_item")}
                errorText={t("no_item")}
                onSelect={(selection: any) =>
                  setOrganizationData({
                    ...organizationData,
                    ["province"]: selection,
                  })
                }
                lable={t("province")}
                required={true}
                selectedItem={organizationData["province"]?.name}
                placeHolder={t("select_a")}
                errorMessage={error.get("province")}
                apiUrl={"provinces/" + CountryEnum.afghanistan}
                mode="single"
                readonly={!hasEdit}
              />
              {organizationData.province && (
                <APICombobox
                  placeholderText={t("search_item")}
                  errorText={t("no_item")}
                  onSelect={(selection: any) =>
                    setOrganizationData({
                      ...organizationData,
                      ["district"]: selection,
                    })
                  }
                  lable={t("district")}
                  required={true}
                  selectedItem={organizationData["district"]?.name}
                  placeHolder={t("select_a")}
                  errorMessage={error.get("district")}
                  apiUrl={"districts/" + organizationData?.province?.id}
                  mode="single"
                  key={organizationData?.province?.id}
                  readonly={!hasEdit}
                />
              )}

              {organizationData.district && (
                <MultiTabInput
                  title={t("area")}
                  parentClassName="w-full"
                  optionalKey={"optional_lang"}
                  onTabChanged={(key: string, tabName: string) => {
                    setOrganizationData({
                      ...organizationData,
                      [key]: tabName,
                      optional_lang: tabName,
                    });
                  }}
                  onChanged={(value: string, name: string) => {
                    setOrganizationData({
                      ...organizationData,
                      [name]: value,
                    });
                  }}
                  name="area"
                  highlightColor="bg-tertiary"
                  userData={organizationData}
                  errorData={error}
                  placeholder={t("content")}
                  className="rtl:text-xl-rtl"
                  tabsClassName="gap-x-5"
                  readOnly={!hasEdit}
                >
                  <SingleTab>english</SingleTab>
                  <SingleTab>farsi</SingleTab>
                  <SingleTab>pashto</SingleTab>
                </MultiTabInput>
              )}
            </BorderContainer>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {failed ? (
          <PrimaryButton
            onClick={async () => await loadInformation()}
            className={`${loading && "opacity-90"} bg-red-500 hover:bg-red-500`}
          >
            {t("failed")}
            <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
          </PrimaryButton>
        ) : (
          organizationData &&
          !registerationExpired &&
          hasEdit && (
            <PrimaryButton onClick={saveData} className={`shadow-lg`}>
              <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
            </PrimaryButton>
          )
        )}
      </CardFooter>
    </Card>
  );
}
