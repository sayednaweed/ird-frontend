import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { useParams } from "react-router";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import type { UserPermission } from "@/database/models";
import type { EditDonorInformation } from "@/lib/types";
import type { ValidateItem } from "@/validation/types";
import { CountryEnum, PermissionEnum } from "@/database/model-enums";
import { toast } from "sonner";
import { RefreshCcw } from "lucide-react";
import type { IDonorInformation } from "@/views/pages/auth-features/donor/edit/donor-edit-page";
import CustomPhoneInput from "@/components/custom-ui/input/custom-phone-input";

interface EditInformationTabProps {
  permissions: UserPermission;
  donorInformation: EditDonorInformation;
  failed: boolean;
  refreshPage: () => Promise<void>;
  loading: boolean;
  setUserData: Dispatch<SetStateAction<IDonorInformation | undefined>>;
}
export default function EditInformationTab(props: EditInformationTabProps) {
  const {
    permissions,
    failed,
    refreshPage,
    loading,
    setUserData,
    donorInformation,
  } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const [storing, setStoring] = useState(false);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const [donorData, setDonorData] =
    useState<EditDonorInformation>(donorInformation);

  useEffect(() => {
    donorData;
  }, []);

  const saveData = async () => {
    if (storing || id === undefined) {
      setStoring(false);
      return;
    }
    setStoring(true);
    // 1. Validate data changes
    // 2. Validate form
    const compulsoryFields: ValidateItem[] = [
      { name: "name_english", rules: ["required", "max:128", "min:5"] },
      { name: "name_farsi", rules: ["required", "max:128", "min:5"] },
      { name: "name_pashto", rules: ["required", "max:128", "min:5"] },
      { name: "abbr", rules: ["required"] },
      { name: "username", rules: ["required"] },
      { name: "contact", rules: ["required", "phone"] },
      { name: "email", rules: ["required"] },
      { name: "province", rules: ["required"] },
      { name: "district", rules: ["required"] },
      { name: "area_english", rules: ["required", "max:128", "min:5"] },
      { name: "area_pashto", rules: ["required", "max:128", "min:5"] },
      { name: "area_farsi", rules: ["required", "max:128", "min:5"] },
    ];
    const passed = await validate(compulsoryFields, donorData, setError);
    if (!passed) {
      setStoring(false);
      return;
    }
    // 2. Store
    const data = {
      id: id,
      name_english: donorData.name_english,
      name_farsi: donorData.name_farsi,
      name_pashto: donorData.name_pashto,
      abbr: donorData.abbr,
      username: donorData.username,
      contact: donorData.contact,
      email: donorData.email,
      province: donorData.province,
      district: donorData.district,
      area_english: donorData.area_english,
      area_pashto: donorData.area_pashto,
      area_farsi: donorData.area_farsi,
    };
    try {
      const response = await axiosClient.put(`donors`, data);
      if (response.status == 200) {
        const newUpdate: EditDonorInformation = {
          id: id,
          name_english: donorData.name_english,
          name_farsi: donorData.name_farsi,
          name_pashto: donorData.name_pashto,
          abbr: donorData.abbr,
          username: donorData.username,
          contact: donorData.contact,
          email: donorData.email,
          area_english: donorData.area_english,
          area_pashto: donorData.area_pashto,
          area_farsi: donorData.area_farsi,
          profile: donorInformation.profile,
          province: donorData.province,
          district: donorData.district,
          created_at: donorInformation.created_at,
          optional_lang: donorInformation.optional_lang,
        };
        setUserData({
          donorInformation: newUpdate,
        });
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };

  const information = permissions.sub.get(PermissionEnum.donor.sub.information);
  const hasEdit = information?.edit;
  return (
    <Card>
      <CardHeader className="space-y-0">
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("account_information")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("update_acc_info")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-x-4 gap-y-6 md:w-[80%] lg:w-1/2 2xl:h-1/3">
        {loading ? (
          <NastranSpinner />
        ) : (
          <>
            <BorderContainer
              title={t("donor_name")}
              required={true}
              parentClassName="p-t-4 pb-0 px-0"
              className="grid grid-cols-1 gap-y-3"
            >
              <MultiTabInput
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setDonorData((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setDonorData((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="name"
                highlightColor="bg-tertiary"
                userData={donorData}
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
              defaultValue={donorData["abbr"]}
              placeholder={t("abbr_english")}
              type="text"
              className="uppercase"
              errorMessage={error.get("abbr")}
              onBlur={(e: any) => {
                const { name, value } = e.target;
                setDonorData({ ...donorData, [name]: value });
              }}
            />
            <CustomInput
              readOnly={!hasEdit}
              required={true}
              requiredHint={`* ${t("required")}`}
              size_="sm"
              label={t("username")}
              name="username"
              defaultValue={donorData["username"]}
              placeholder={t("username")}
              type="text"
              className="uppercase"
              errorMessage={error.get("username")}
              onBlur={(e: any) => {
                const { name, value } = e.target;
                setDonorData({ ...donorData, [name]: value });
              }}
            />

            <CustomPhoneInput
              label={t("contact")}
              onChange={(e: any) => {
                const { name, value } = e.target;
                setDonorData({ ...donorData, [name]: value });
              }}
              value={donorData["contact"]}
              name="contact"
              errorMessage={error.get("contact")}
              required={true}
              requiredHint={`* ${t("required")}`}
              readOnly={!hasEdit}
            />

            <CustomInput
              size_="sm"
              name="email"
              required={true}
              requiredHint={`* ${t("required")}`}
              label={t("email")}
              defaultValue={donorData["email"]}
              placeholder={t("enter_your_email")}
              type="email"
              errorMessage={error.get("email")}
              onChange={(e: any) => {
                const { name, value } = e.target;
                setDonorData({ ...donorData, [name]: value });
              }}
              dir="ltr"
              className="rtl:text-right"
              readOnly={!hasEdit}
            />

            <BorderContainer
              title={t("address")}
              required={true}
              parentClassName="mt-3"
              className="flex flex-col items-start gap-y-3"
            >
              <APICombobox
                placeholderText={t("search_item")}
                errorText={t("no_item")}
                onSelect={(selection: any) =>
                  setDonorData({ ...donorData, ["province"]: selection })
                }
                lable={t("province")}
                required={true}
                selectedItem={donorData["province"]?.name}
                placeHolder={t("select_a")}
                errorMessage={error.get("province")}
                apiUrl={"provinces/" + CountryEnum.afghanistan}
                mode="single"
                readonly={!hasEdit}
              />
              {donorData.province && (
                <APICombobox
                  placeholderText={t("search_item")}
                  errorText={t("no_item")}
                  onSelect={(selection: any) =>
                    setDonorData({ ...donorData, ["district"]: selection })
                  }
                  lable={t("district")}
                  required={true}
                  selectedItem={donorData["district"]?.name}
                  placeHolder={t("select_a")}
                  errorMessage={error.get("district")}
                  apiUrl={"districts/" + donorData?.province?.id}
                  mode="single"
                  key={donorData?.province?.id}
                  readonly={!hasEdit}
                />
              )}

              {donorData.district && (
                <MultiTabInput
                  title={t("area")}
                  parentClassName="w-full"
                  optionalKey={"optional_lang"}
                  onTabChanged={(key: string, tabName: string) => {
                    setDonorData({
                      ...donorData,
                      [key]: tabName,
                      optional_lang: tabName,
                    });
                  }}
                  onChanged={(value: string, name: string) => {
                    setDonorData({
                      ...donorData,
                      [name]: value,
                    });
                  }}
                  name="area"
                  highlightColor="bg-tertiary"
                  userData={donorData}
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

            {failed ? (
              <PrimaryButton
                onClick={async () => await refreshPage()}
                className="bg-red-500 hover:bg-red-500/70"
              >
                {t("failed_retry")}
                <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
              </PrimaryButton>
            ) : (
              hasEdit && (
                <PrimaryButton
                  disabled={storing}
                  onClick={saveData}
                  className={`shadow-lg`}
                >
                  <ButtonSpinner loading={storing}>{t("save")}</ButtonSpinner>
                </PrimaryButton>
              )
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
