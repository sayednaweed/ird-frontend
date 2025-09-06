import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useModelOnRequestHide } from "@/components/custom-ui/model/hook/useModelOnRequestHide";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import { useEffect, useState } from "react";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import axiosClient from "@/lib/axois-client";
import { setServerError, validate } from "@/validation/validation";
import { useParams } from "react-router";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import MultiTabInput from "@/components/custom-ui/input/mult-tab/MultiTabInput";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import type { Director, OrganizationDirector } from "@/database/models";
import { toast } from "sonner";
import { CountryEnum } from "@/database/model-enums";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";

export interface EditDirectorDialogProps {
  onComplete: (director: Director, isEdit: boolean) => void;
  director?: Director;
  hasEdit?: boolean;
  onCancel?: () => void;
}
export default function EditDirectorDialog(props: EditDirectorDialogProps) {
  const { onComplete, director, hasEdit, onCancel } = props;
  const [loading, setLoading] = useState(false);
  const [storing, setStoring] = useState(false);
  const [error, setError] = useState(new Map<string, string>());
  let { id } = useParams();

  const [userData, setUserData] = useState<OrganizationDirector>({
    name_english: "",
    name_pashto: "",
    name_farsi: "",
    surname_english: "",
    surname_pashto: "",
    surname_farsi: "",
    contact: "",
    email: "",
    gender: undefined,
    moe_registration_no: "",
    nationality: undefined,
    nid: "",
    identity_type: undefined,
    province: undefined,
    district: undefined,
    establishment_date: undefined,
    is_active: false,
    optional_lang: "english",
    area_english: "",
    area_farsi: "",
    area_pashto: "",
  });
  const { modelOnRequestHide } = useModelOnRequestHide();
  const { t } = useTranslation();

  const fetch = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(
        `organizations/director/${director?.id}`
      );
      if (response.status === 200) {
        const director = response.data.director;
        setUserData(director);
      }
    } catch (error: any) {
      console.log(error);
    }
    setLoading(false);
  };
  useEffect(() => {
    if (director) fetch();
  }, []);

  const addOrUpdate = async () => {
    try {
      if (storing) return;
      setStoring(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "name_english",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "name_farsi",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "name_pashto",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "surname_english",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "surname_pashto",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "surname_farsi",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "contact",
            rules: ["required"],
          },
          {
            name: "email",
            rules: ["required"],
          },
          {
            name: "gender",
            rules: ["required"],
          },
          {
            name: "nationality",
            rules: ["required"],
          },
          {
            name: "identity_type",
            rules: ["required"],
          },
          {
            name: "nid",
            rules: ["required"],
          },
          {
            name: "province",
            rules: ["required"],
          },
          {
            name: "district",
            rules: ["required"],
          },
          {
            name: "area_english",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "area_farsi",
            rules: ["required", "max:128", "min:3"],
          },
          {
            name: "area_pashto",
            rules: ["required", "max:128", "min:3"],
          },
        ],
        userData,
        setError
      );
      if (!passed) return;
      // 2. Store
      const data = {
        id: director ? director?.id : id,
        name_english: userData.name_english,
        name_farsi: userData.name_farsi,
        name_pashto: userData.name_pashto,
        surname_english: userData.surname_english,
        surname_farsi: userData.surname_farsi,
        surname_pashto: userData.surname_pashto,
        contact: userData.contact,
        email: userData.email,
        gender: userData.gender,
        nationality: userData.nationality,
        identity_type: userData.identity_type,
        nid: userData.nid,
        province: userData.province,
        district: userData.district,
        area_english: userData.area_english,
        area_farsi: userData.area_farsi,
        area_pashto: userData.area_pashto,
        is_active: userData.is_active,
      };
      const url = "organizations/director";
      const response = director
        ? await axiosClient.put(url, data)
        : await axiosClient.post(url, data);
      if (response.status === 200) {
        toast.success(response.data.message);
        onComplete(response.data.director, director ? true : false);
        modelOnRequestHide();
      }
    } catch (error: any) {
      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setStoring(false);
    }
  };
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    if (userData) setUserData({ ...userData, [name]: value });
  };

  return (
    <Card className="w-full self-center [backdrop-filter:blur(20px)] bg-card dark:bg-card-secondary">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-3xl-ltr text-tertiary">
          {director ? t("edit") : t("add")}
        </CardTitle>
      </CardHeader>
      {loading ? (
        <NastranSpinner className=" mx-auto" />
      ) : (
        <CardContent className="flex flex-col mt-10 w-full md:w-[60%] gap-y-6 pb-12">
          <BorderContainer
            title={t("name")}
            required={true}
            parentClassName="p-t-4 pb-0 px-0"
            className="grid grid-cols-1 gap-y-3"
          >
            <MultiTabInput
              optionalKey={"optional_lang"}
              onTabChanged={(key: string, tabName: string) => {
                setUserData({
                  ...userData,
                  [key]: tabName,
                  optional_lang: tabName,
                });
              }}
              onChanged={(value: string, name: string) => {
                setUserData({
                  ...userData,
                  [name]: value,
                });
              }}
              name="name"
              highlightColor="bg-tertiary"
              userData={userData}
              errorData={error}
              placeholder={t("content")}
              className="rtl:text-xl-rtl rounded-none border-t border-x-0 border-b-0 resize-none"
              tabsClassName="gap-x-5 px-3"
            >
              <SingleTab>english</SingleTab>
              <SingleTab>farsi</SingleTab>
              <SingleTab>pashto</SingleTab>
            </MultiTabInput>
          </BorderContainer>

          <BorderContainer
            title={t("director_sur_en")}
            required={true}
            parentClassName="p-t-4 pb-0 px-0"
            className="grid grid-cols-1 gap-y-3"
          >
            <MultiTabInput
              optionalKey={"optional_lang"}
              onTabChanged={(key: string, tabName: string) => {
                setUserData({
                  ...userData,
                  [key]: tabName,
                  optional_lang: tabName,
                });
              }}
              onChanged={(value: string, name: string) => {
                setUserData({
                  ...userData,
                  [name]: value,
                });
              }}
              name="surname"
              highlightColor="bg-tertiary"
              userData={userData}
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
            size_="sm"
            dir="ltr"
            required={true}
            requiredHint={`* ${t("required")}`}
            className="rtl:text-end"
            label={t("contact")}
            placeholder={t("enter_ur_pho_num")}
            defaultValue={userData.contact}
            type="text"
            name="contact"
            errorMessage={error.get("contact")}
            onChange={handleChange}
          />
          <CustomInput
            size_="sm"
            dir="ltr"
            required={true}
            requiredHint={`* ${t("required")}`}
            className="rtl:text-end"
            label={t("email")}
            placeholder={t("enter_your_email")}
            defaultValue={userData.email}
            type="text"
            name="email"
            errorMessage={error.get("email")}
            onChange={handleChange}
          />
          <APICombobox
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) =>
              setUserData({ ...userData, ["gender"]: selection })
            }
            lable={t("gender")}
            required={true}
            selectedItem={userData?.gender?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("gender")}
            apiUrl={"genders"}
            mode="single"
          />

          <APICombobox
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) =>
              setUserData({ ...userData, ["nationality"]: selection })
            }
            lable={t("nationality")}
            required={true}
            selectedItem={userData?.nationality?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("nationality")}
            apiUrl={"nationalities"}
            mode="single"
          />
          <APICombobox
            placeholderText={t("search_item")}
            errorText={t("no_item")}
            onSelect={(selection: any) =>
              setUserData({ ...userData, ["identity_type"]: selection })
            }
            lable={t("identity_type")}
            required={true}
            selectedItem={userData?.identity_type?.name}
            placeHolder={t("select_a")}
            errorMessage={error.get("identity_type")}
            apiUrl={"nid/types"}
            mode="single"
          />

          <CustomInput
            size_="sm"
            dir="ltr"
            required={true}
            requiredHint={`* ${t("required")}`}
            className="rtl:text-end"
            label={t("nid")}
            placeholder={t("enter_ur_pho_num")}
            defaultValue={userData?.nid}
            type="text"
            name="nid"
            errorMessage={error.get("nid")}
            onChange={handleChange}
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
                setUserData({ ...userData, ["province"]: selection })
              }
              lable={t("province")}
              required={true}
              selectedItem={userData?.province?.name}
              placeHolder={t("select_a")}
              errorMessage={error.get("province")}
              apiUrl={"provinces/" + CountryEnum.afghanistan}
              mode="single"
            />
            {userData.province && (
              <APICombobox
                placeholderText={t("search_item")}
                errorText={t("no_item")}
                onSelect={(selection: any) =>
                  setUserData({ ...userData, ["district"]: selection })
                }
                lable={t("district")}
                required={true}
                selectedItem={userData?.district?.name}
                placeHolder={t("select_a")}
                errorMessage={error.get("district")}
                apiUrl={"districts/" + userData.province?.id}
                mode="single"
                key={userData?.province?.id}
              />
            )}

            {userData.district && (
              <MultiTabTextarea
                title={t("area")}
                parentClassName="w-full"
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData({
                    ...userData,
                    [key]: tabName,
                    optional_lang: tabName,
                  });
                }}
                onChanged={(value: string, name: string) => {
                  setUserData({
                    ...userData,
                    [name]: value,
                  });
                }}
                name="area"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("content")}
                rows={5}
                className="rtl:text-xl-rtl"
                tabsClassName="gap-x-5"
              >
                <SingleTab>english</SingleTab>
                <SingleTab>farsi</SingleTab>
                <SingleTab>pashto</SingleTab>
              </MultiTabTextarea>
            )}
          </BorderContainer>
          <CustomCheckbox
            checked={userData.is_active}
            onCheckedChange={(value: boolean) =>
              setUserData({ ...userData, is_active: value })
            }
            parentClassName="rounded py-[12px] gap-x-1 bg-card border px-[10px]"
            text={t("active")}
            description={t("active_des")}
          />
        </CardContent>
      )}
      <CardFooter className="flex justify-between">
        <Button
          className="rtl:text-xl-rtl ltr:text-lg-ltr"
          variant="outline"
          onClick={() => {
            modelOnRequestHide();
            if (onCancel) onCancel();
          }}
        >
          {t("cancel")}
        </Button>
        {hasEdit && (
          <PrimaryButton
            disabled={storing || loading}
            onClick={addOrUpdate}
            className={`${storing && "opacity-90"}`}
            type="submit"
          >
            <ButtonSpinner loading={storing}>{t("save")}</ButtonSpinner>
          </PrimaryButton>
        )}
      </CardFooter>
    </Card>
  );
}
