import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import FileChooser from "@/components/custom-ui/chooser/FileChooser";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";
import BorderContainer from "@/components/custom-ui/container/BorderContainer";
import CustomDatePicker from "@/components/custom-ui/datePicker/custom-date-picker";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PermissionEnum } from "@/database/model-enums";
import type { UserPermission } from "@/database/models";
import axiosClient from "@/lib/axois-client";
import type { FileType } from "@/lib/types";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type { ValidateItem } from "@/validation/types";
import { validate } from "@/validation/validation";
import { RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DateObject } from "react-multi-date-picker";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
interface IEditNews {
  id: string;
  title_english: string;
  title_farsi: string;
  title_pashto: string;
  content_english: string;
  content_farsi: string;
  content_pashto: string;
  type: {
    id: string;
    value: string;
  };
  priority: {
    id: string;
    value: string;
  };
  cover_pic: File | FileType;
  date: DateObject;
  visible: boolean;
  user: string;
  visibility_date: DateObject | undefined;
  optional_lang: string;
  visibility_duration: boolean;
}

export default function EditNews() {
  const { user } = useUserAuthState();
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const { t } = useTranslation();
  let { id } = useParams();
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(new Map<string, string>());
  const [userData, setUserData] = useState<IEditNews | undefined>();
  const loadInformation = async () => {
    try {
      setFailed(false);
      const response = await axiosClient.get(`newses/${id}`);
      if (response.status == 200) {
        // Check if visibility_date is not null make visibility_duration true
        const news: IEditNews = response.data.news;
        news.visibility_duration = news.visibility_date == null ? false : true;
        news.visible = response.data.news.visible === 1 ? true : false;
        news.date = new DateObject(new Date(response.data.news.date));
        if (news.visibility_duration) {
          news.visibility_date = new DateObject(
            new Date(response.data.news.visibility_date)
          );
        } else {
          news.visibility_date = undefined;
        }
        setUserData(news);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
      setFailed(true);
    }
  };
  useEffect(() => {
    loadInformation();
  }, []);

  const saveData = async () => {
    if (loading || !userData) {
      setLoading(false);
      return;
    }
    const rules: ValidateItem[] = [];
    if (userData.visibility_duration) {
      rules.push({
        name: "visibility_date",
        rules: ["required"],
      });
    }
    const passed = await validate(rules, userData, setError);
    if (!passed) {
      return false;
    }
    setLoading(true);
    // 2. Store
    let formData = new FormData();
    formData.append("id", userData.id);
    if (userData.visibility_date)
      formData.append(
        "visibility_date",
        userData.visibility_date.toDate().toISOString()
      );
    formData.append("title_english", userData.title_english);
    formData.append("title_farsi", userData.title_farsi);
    formData.append("title_pashto", userData.title_pashto);
    formData.append("content_english", userData.content_english);
    formData.append("content_farsi", userData.content_farsi);
    formData.append("content_pashto", userData.content_pashto);
    formData.append("visible", userData.visible ? "1" : "0");
    formData.append("type", userData?.type?.id);
    formData.append("priority", userData?.priority?.id);
    formData.append("date", userData.date.toDate().toISOString());
    if (userData.cover_pic instanceof File)
      formData.append("cover_pic", userData.cover_pic);
    else formData.append("cover_pic", userData.cover_pic.path);
    // For optimization
    try {
      const response = await axiosClient.post("newses", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        params: {
          _method: "PUT", // Laravel treats this POST as a PUT
        },
      });
      if (response.status == 200) {
        // Update user state
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const permissions: UserPermission = user?.permissions.get(
    PermissionEnum.about.name
  ) as UserPermission;
  const per = permissions.sub.get(PermissionEnum.about.sub.news);
  const hasEdit = per?.edit;

  return (
    <div className="flex flex-col gap-y-6 px-3 mt-2">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem onClick={() => navigate(-1)}>
          {t("news")}
        </BreadcrumbItem>
      </Breadcrumb>
      <Card>
        <CardHeader className="space-y-0">
          <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
            {t("edit")}
          </CardTitle>
          <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
            {t("edit_news_desc")}
          </CardDescription>
          {userData?.user && (
            <div className="grid gap-x-4 xxl:grid-cols-[auto_1fr] items-center bg-fourth/10 w-fit px-3 py-1 rounded mt-4">
              <h1 className="ltr:text-2xl-ltr font-semibold">
                {t("saved_by")}:
              </h1>
              <h1 className="ltr:text-2xl-ltr font-medium break-all text-wrap">
                {userData?.user}
              </h1>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {failed ? (
            <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
          ) : userData === undefined ? (
            <NastranSpinner />
          ) : (
            <>
              <div className="flex flex-col w-full md:w-[60%] lg:w-[400px] gap-y-6 pb-12">
                <BorderContainer
                  title={t("title")}
                  required={true}
                  parentClassName="p-t-4 pb-0 px-0"
                  className="grid grid-cols-1 gap-y-3"
                >
                  <MultiTabTextarea
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
                    name="title"
                    highlightColor="bg-tertiary"
                    userData={userData}
                    errorData={error}
                    placeholder={t("detail")}
                    rows={1}
                    className="rtl:text-xl-rtl rounded-none border-t border-x-0"
                    tabsClassName="gap-x-5 px-3"
                  >
                    <SingleTab>english</SingleTab>
                    <SingleTab>farsi</SingleTab>
                    <SingleTab>pashto</SingleTab>
                  </MultiTabTextarea>
                </BorderContainer>
                <APICombobox
                  placeholderText={t("search_item")}
                  errorText={t("no_item")}
                  onSelect={(selection: any) =>
                    setUserData({ ...userData, ["type"]: selection })
                  }
                  lable={t("type")}
                  required={true}
                  selectedItem={userData.type.value}
                  placeHolder={t("select_a")}
                  errorMessage={error.get("type")}
                  apiUrl={"news-types"}
                  mode="single"
                />
                <APICombobox
                  placeholderText={t("search_item")}
                  errorText={t("no_item")}
                  onSelect={(selection: any) =>
                    setUserData({ ...userData, ["priority"]: selection })
                  }
                  lable={t("priority")}
                  required={true}
                  selectedItem={userData.priority.value}
                  placeHolder={t("select_a")}
                  errorMessage={error.get("priority")}
                  apiUrl={"priorities"}
                  mode="single"
                />
                <CustomDatePicker
                  placeholder={t("select_a_date")}
                  lable={t("date")}
                  requiredHint={`* ${t("required")}`}
                  required={true}
                  value={userData.date}
                  dateOnComplete={(date: DateObject) => {
                    setUserData({ ...userData, date: date });
                  }}
                  className="py-3"
                  errorMessage={error.get("date")}
                />

                <BorderContainer
                  title={t("visibility")}
                  required={false}
                  parentClassName="mt-3"
                  className="flex flex-col items-start gap-y-3"
                >
                  <CustomCheckbox
                    checked={userData.visible}
                    onCheckedChange={(value: boolean) =>
                      setUserData({ ...userData, visible: value })
                    }
                    parentClassName="rounded-md py-[12px] gap-x-1 bg-card border px-[10px]"
                    text={t("visible")}
                    description={t("visibility_duration_des")}
                    errorMessage={error.get("visible")}
                  />
                  <CustomCheckbox
                    checked={userData["visibility_duration"]}
                    onCheckedChange={(value: boolean) =>
                      setUserData({ ...userData, visibility_duration: value })
                    }
                    parentClassName="rounded-md py-[12px] gap-x-1 bg-card border px-[10px]"
                    text={t("visibility_duration")}
                    description={t("visibility_duration_des")}
                    errorMessage={error.get("visibility_duration")}
                  />
                  {userData.visibility_duration && (
                    <CustomDatePicker
                      placeholder={t("select_a_date")}
                      lable={t("visibility_date")}
                      requiredHint={`* ${t("required")}`}
                      required={true}
                      value={userData.visibility_date}
                      dateOnComplete={(date: DateObject) => {
                        setUserData({ ...userData, visibility_date: date });
                      }}
                      className="py-3 w-full"
                      parentClassName="w-full"
                      errorMessage={error.get("visibility_date")}
                    />
                  )}
                </BorderContainer>
              </div>
              <BorderContainer
                title={t("content")}
                required={true}
                parentClassName="p-t-4 pb-0 px-0"
                className="grid grid-cols-1 gap-y-3"
              >
                <MultiTabTextarea
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
                  name="content"
                  highlightColor="bg-tertiary"
                  userData={userData}
                  errorData={error}
                  placeholder={t("detail")}
                  rows={3}
                  className="rtl:text-xl-rtl rounded-none border-t border-x-0"
                  tabsClassName="gap-x-5 px-3"
                >
                  <SingleTab>english</SingleTab>
                  <SingleTab>farsi</SingleTab>
                  <SingleTab>pashto</SingleTab>
                </MultiTabTextarea>
              </BorderContainer>

              <FileChooser
                parentClassName="mt-6 w-full md:w-[60%] lg:w-[400px]"
                lable={t("cover_pic")}
                required={true}
                requiredHint={`* ${t("required")}`}
                defaultFile={userData.cover_pic}
                errorMessage={error.get("cover_pic")}
                onchange={(file: File | undefined) => {
                  if (file) setUserData({ ...userData, cover_pic: file });
                }}
                downloadParam={
                  userData.cover_pic instanceof File
                    ? undefined
                    : {
                        path: userData.cover_pic?.path,
                        fileName: userData.cover_pic.name,
                      }
                }
                validTypes={["image/png", "image/jpeg", "image/gif"]}
                maxSize={2}
                accept="image/png, image/jpeg, image/gif"
              />
            </>
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
              <PrimaryButton
                onClick={async () => {
                  if (loading) return;
                  await saveData();
                }}
                className={`shadow-lg mt-8`}
              >
                <ButtonSpinner loading={loading}>{t("save")}</ButtonSpinner>
              </PrimaryButton>
            )
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
