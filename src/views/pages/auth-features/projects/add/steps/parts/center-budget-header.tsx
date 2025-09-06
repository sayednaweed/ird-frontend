import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MultipleSelector from "@/components/custom-ui/select/MultipleSelector";
import { ChevronsDown, MessageCircleQuestion, Save } from "lucide-react";
import SingleTab from "@/components/custom-ui/input/mult-tab/parts/SingleTab";
import MultiTabTextarea from "@/components/custom-ui/input/mult-tab/MultiTabTextarea";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { validate } from "@/validation/validation";
import type { CenterBudget } from "@/database/models";
import { generateUUID, isObjectEmpty, valueIsNumber } from "@/lib/utils";
import { toast } from "sonner";
import type { Option } from "@/lib/types";
import { CountryEnum } from "@/database/model-enums";
import { IconTooltip } from "@/components/custom-ui/tooltip/icon-tooltip";

export interface CenterBudgetHeaderProps {
  onComplete: (center: CenterBudget) => boolean;
  onEditComplete: (center: CenterBudget) => boolean;
  editCenter?: CenterBudget;
}
export default function CenterBudgetHeader(props: CenterBudgetHeaderProps) {
  const { onComplete, editCenter, onEditComplete } = props;
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>([]);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const { t } = useTranslation();
  useEffect(() => {
    if (editCenter) {
      setUserData(editCenter);
    }
  }, [editCenter]);

  const handleNumberChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (valueIsNumber(value)) {
      setUserData((prev: any) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const store = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 1. Validate form
      const passed = await validate(
        [
          {
            name: "province",
            rules: ["required"],
          },
          {
            name: "district",
            rules: ["required"],
          },
          {
            name: "health_centers_english",
            rules: ["required"],
          },
          {
            name: "health_centers_farsi",
            rules: ["required"],
          },
          {
            name: "health_centers_pashto",
            rules: ["required"],
          },
          {
            name: "budget",
            rules: ["required"],
          },
          {
            name: "direct_benefi",
            rules: ["required"],
          },
          {
            name: "in_direct_benefi",
            rules: ["required"],
          },
          {
            name: "address_english",
            rules: ["required"],
          },
          {
            name: "address_pashto",
            rules: ["required"],
          },
          {
            name: "address_farsi",
            rules: ["required"],
          },
          {
            name: "health_worker_english",
            rules: ["required"],
          },
          {
            name: "health_worker_farsi",
            rules: ["required"],
          },
          {
            name: "health_worker_pashto",
            rules: ["required"],
          },
          {
            name: "fin_admin_employees_english",
            rules: ["required"],
          },
          {
            name: "fin_admin_employees_farsi",
            rules: ["required"],
          },
          {
            name: "fin_admin_employees_pashto",
            rules: ["required"],
          },
        ],
        userData,
        setError
      );
      // Validation Next step
      const newError = new Map<string, string>();
      let validatationFailed = false;
      if (isObjectEmpty(userData?.villages) && userData?.selectedDistrictId) {
        for (const dis of userData?.district) {
          const village = userData?.villages[dis?.id];

          if (village) {
            ["village_english", "village_pashto", "village_farsi"].forEach(
              (item: string) => {
                if (!village[item]) {
                  newError.set(item, `${t(item)} ${t("is_required")}`);
                  newError.set(`${dis?.id}`, "");
                  validatationFailed = true;
                }
              }
            );
          } else {
            newError.set(
              "village_english",
              `${t("village_farsi")} ${t("is_required")}`
            );
            newError.set(
              "village_pashto",
              `${t("village_farsi")} ${t("is_required")}`
            );
            newError.set(
              "village_farsi",
              `${t("village_farsi")} ${t("is_required")}`
            );
            newError.set(`${dis?.id}`, "");
            validatationFailed = true;
          }
        }
      } else {
        newError.set(
          "village_english",
          `${t("village_farsi")} ${t("is_required")}`
        );
        newError.set(
          "village_pashto",
          `${t("village_farsi")} ${t("is_required")}`
        );
        newError.set(
          "village_farsi",
          `${t("village_farsi")} ${t("is_required")}`
        );
        const options: Option[] = userData?.district;
        if (userData?.district) {
          for (const dis of options) {
            newError.set(`${dis?.id}`, "");
          }
        }
        validatationFailed = true;
      }
      setError((prev) => new Map([...prev, ...newError]));
      if (validatationFailed) return;
      if (!passed) return;
      // 2. Complete
      const center = {
        id: editCenter ? userData?.id : generateUUID(),
        province: userData?.province,
        district: userData?.district,
        villages: userData?.villages,
        health_centers_english: userData?.health_centers_english,
        health_centers_pashto: userData?.health_centers_pashto,
        health_centers_farsi: userData?.health_centers_farsi,
        budget: userData?.budget,
        selectedDistrictId: userData?.selectedDistrictId,
        direct_benefi: userData?.direct_benefi,
        in_direct_benefi: userData?.in_direct_benefi,
        address_english: userData?.address_english,
        address_pashto: userData?.address_pashto,
        address_farsi: userData?.address_farsi,
        health_worker_english: userData?.health_worker_english,
        health_worker_pashto: userData?.health_worker_pashto,
        health_worker_farsi: userData?.health_worker_farsi,
        fin_admin_employees_english: userData?.fin_admin_employees_english,
        fin_admin_employees_pashto: userData?.fin_admin_employees_pashto,
        fin_admin_employees_farsi: userData?.fin_admin_employees_farsi,
      };
      if (editCenter) {
        const failed = onEditComplete(center);
        if (failed) return;
      } else {
        const failed = onComplete(center);
        if (failed) return;
      }
      setUserData(() => []);
    } catch (error: any) {
      toast.error(t("error"));
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const viewDistrictVillage = (option: Option) => {
    setUserData((prev: any) => ({
      ...prev,
      // district: option,
      selectedDistrictId: option?.id,
    }));
  };
  const province = useMemo(() => {
    return (
      <MultipleSelector
        popoverClassName="h-36"
        commandProps={{
          label: "Select frameworks",
          className: "mt-0 h-full min-w-[11rem] max-w-[11rem]",
        }}
        placeholder={t("select")}
        onChange={(option: Option[]) => {
          const villages: any = {};
          setUserData((prev: any) => ({
            ...prev,
            province: option[0],
            district: [],
            villages: villages,
          }));
        }}
        // defaultOptions={frameworks}
        selectedOptions={
          userData.province && !Array.isArray(userData.province)
            ? ([userData.province] as Option[])
            : []
        }
        errorMessage={error.get("province")}
        apiUrl={"provinces/" + CountryEnum.afghanistan}
        emptyIndicator={<p className="text-center text-sm">{t("no_item")}</p>}
        className="m-0 rounded-none border-none h-full min-w-[160px] max-w-[160px]"
        maxSelected={1}
        required={false}
      />
    );
  }, [error, userData?.province?.id]);

  const removeVillages = (all: boolean, option?: any) => {
    if (all) {
      setUserData((prev: any) => {
        return { ...prev, villages: {} };
      });
    } else {
      setUserData((prev: any) => {
        const { [option?.id]: _, ...rest } = userData?.villages;
        return { ...prev, villages: rest };
      });
    }
  };
  const district = useMemo(() => {
    return (
      <MultipleSelector
        key={userData?.province ? userData?.province?.name : null}
        popoverClassName="h-36"
        placeholder={t("select")}
        commandProps={{
          label: "Select frameworks",
          className: "mt-0 h-full min-w-[238px] max-w-[238px]",
        }}
        onChange={(option: Option[]) => {
          setUserData((prev: any) => ({
            ...prev,
            district: option,
            selectedDistrictId: option[option.length - 1]?.id,
          }));
        }}
        onUnselect={(option: Option) => removeVillages(false, option)}
        showView={true}
        onViewClick={viewDistrictVillage}
        errorMessage={error.get("district")}
        error={error}
        selectedOptions={userData.district as Option[]}
        required={true}
        apiUrl={"districts/" + userData?.province?.id}
        emptyIndicator={<p className="text-center text-sm">{t("no_item")}</p>}
        className="m-0 bg-card rounded-none border-none h-full"
        shouldFetch={userData?.province ? true : false}
      />
    );
  }, [userData?.province?.id, error]);

  return (
    <div className="flex flex-col">
      <div className="col-span-full border overflow-auto p-4">
        <ul className="w-full h-fit min-w-fit">
          {/* Header Row */}
          <li className="grid grid-cols-[11rem_15rem_1fr_1fr_8rem_8rem_8rem_1fr] [&>div]:border bg-primary/5 font-semibold">
            <div className="flex justify-start text-wrap p-2">
              <h1>{t("province")}</h1>
            </div>
            <div className="flex justify-start text-wrap p-2">
              <h1>{t("district")}</h1>
            </div>
            <div className="flex justify-between text-wrap text-center p-2 items-start">
              <h1>{t("village")}</h1>
              <IconTooltip
                icon={
                  <MessageCircleQuestion className="size-[18px] text-blue-800 dark:text-white" />
                }
              >
                <h1 className="font-medium ltr:text-2xl-ltr">
                  {t("guideline")}
                </h1>
                <h1 className="ltr:text-xl-ltr">{t("g_w_des")}</h1>
              </IconTooltip>
            </div>
            <div className="flex justify-between text-wrap text-center p-2 items-start">
              <h1>{t("health_centers")}</h1>
              <IconTooltip
                icon={
                  <MessageCircleQuestion className="size-[18px] text-blue-800 dark:text-white" />
                }
              >
                <h1 className="font-medium ltr:text-2xl-ltr">
                  {t("guideline")}
                </h1>
                <h1 className="ltr:text-xl-ltr">{t("g_w_des")}</h1>
              </IconTooltip>
            </div>
            <div className="flex justify-start text-wrap p-2">
              <h1>{t("budget")}</h1>
            </div>
            <div className="flex justify-start text-wrap p-2">
              <h1>{t("direct_benefi")}</h1>
            </div>
            <div className="flex justify-start text-wrap p-2">
              <h1>{t("in_direct_benefi")}</h1>
            </div>
            <div className="flex justify-between text-wrap text-center p-2 items-start">
              <h1>{t("address")}</h1>
              <IconTooltip
                icon={
                  <MessageCircleQuestion className="size-[18px] text-blue-800 dark:text-white" />
                }
              >
                <h1 className="font-medium ltr:text-2xl-ltr">
                  {t("guideline")}
                </h1>
                <h1 className="ltr:text-xl-ltr">{t("a_w_des")}</h1>
              </IconTooltip>
            </div>
          </li>

          {/* Data Row */}
          <li className="grid grid-cols-[11rem_15rem_1fr_1fr_8rem_8rem_8rem_1fr]">
            <div className="border">{province}</div>
            <div className="border">{district}</div>
            <div className="border">
              <MultiTabTextarea
                disabled={userData?.selectedDistrictId ? false : true}
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData((prev: any) => {
                    let villages = userData?.villages;
                    let districtVillage =
                      userData?.villages[userData?.selectedDistrictId];
                    villages = {
                      ...villages,
                      [userData?.selectedDistrictId]: {
                        ...districtVillage,
                        [key]: tabName,
                        optional_lang: tabName,
                      },
                    };
                    return { ...prev, villages: villages };
                  });
                }}
                onChanged={(value: string, name: string) => {
                  setUserData((prev: any) => {
                    let villages = userData?.villages;
                    let districtVillage =
                      userData?.villages[userData?.selectedDistrictId];
                    villages = {
                      ...villages,
                      [userData?.selectedDistrictId]: {
                        ...districtVillage,
                        [name]: value,
                      },
                    };
                    return { ...prev, villages: villages };
                  });
                }}
                name="village"
                highlightColor="bg-tertiary"
                userData={
                  isObjectEmpty(userData?.villages) &&
                  userData?.villages[userData?.selectedDistrictId]
                    ? userData?.villages[userData?.selectedDistrictId]
                    : userData
                }
                errorData={error}
                key={
                  userData?.selectedDistrictId && userData?.selectedDistrictId
                }
                placeholder={t("enter")}
                className="rtl:text-xl-rtl resize ltr:placeholder:text-xl-ltr rounded-none m-0 border-t border-x-0 border-b-0"
                tabsClassName="gap-0"
              >
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  english
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  farsi
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  pashto
                </SingleTab>
              </MultiTabTextarea>
            </div>
            <div className="border">
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="health_centers"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("enter")}
                className="rtl:text-xl-rtl resize ltr:placeholder:text-xl-ltr rounded-none m-0 border-t border-x-0 border-b-0"
                tabsClassName="gap-0"
              >
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  english
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  farsi
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  pashto
                </SingleTab>
              </MultiTabTextarea>
            </div>
            <div className="border">
              <textarea
                name="budget"
                value={userData.budget || ""}
                className={`h-full w-full resize-none px-3 pt-1 placeholder:text-muted-foreground ltr:placeholder:text-xl-ltr focus-visible:ring-0 focus-visible:outline-none ${
                  error.get("budget") && "border border-red-400"
                }`}
                placeholder={t("enter")}
                onChange={handleNumberChange}
              />
            </div>
            <div className="border">
              <textarea
                name="direct_benefi"
                value={userData.direct_benefi || ""}
                className={`h-full w-full resize-none px-3 pt-1 placeholder:text-muted-foreground ltr:placeholder:text-xl-ltr focus-visible:ring-0 focus-visible:outline-none ${
                  error.get("direct_benefi") && "border border-red-400"
                }`}
                placeholder={t("enter")}
                onChange={handleNumberChange}
              />
            </div>
            <div className="border">
              <textarea
                name="in_direct_benefi"
                value={userData.in_direct_benefi || ""}
                className={`h-full w-full resize-none px-3 pt-1 placeholder:text-muted-foreground ltr:placeholder:text-xl-ltr focus-visible:ring-0 focus-visible:outline-none ${
                  error.get("in_direct_benefi") && "border border-red-400"
                }`}
                placeholder={t("enter")}
                onChange={handleNumberChange}
              />
            </div>
            <div className="border">
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="address"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("enter")}
                className="rtl:text-xl-rtl resize ltr:placeholder:text-xl-ltr rounded-none m-0 border-t border-x-0 border-b-0"
                tabsClassName="gap-0"
              >
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  english
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  farsi
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  pashto
                </SingleTab>
              </MultiTabTextarea>
            </div>
          </li>
          {/* Project Employees */}
          <li className="grid grid-cols-1 border bg-primary/5">
            <h1 className="text-center p-4 font-bold ltr:text-[17px] text-primary">
              {t("proj_employees")}
            </h1>
          </li>
          {/* Header Row */}
          <li className="grid grid-cols-2 [&>div]:border bg-primary/5 font-semibold">
            <div className="flex justify-between text-wrap text-center p-2 items-center">
              <h1>{t("health_worker")}</h1>
              <IconTooltip
                icon={
                  <MessageCircleQuestion className="size-[18px] text-blue-800 dark:text-white" />
                }
              >
                <h1 className="font-medium ltr:text-2xl-ltr">
                  {t("guideline")}
                </h1>
                <h1 className="ltr:text-xl-ltr">{t("h_w_w_des")}</h1>
              </IconTooltip>
            </div>
            <div className="flex justify-between text-wrap text-center p-2 items-center">
              <h1>{t("fin_admin_employees")}</h1>
              <IconTooltip
                icon={
                  <MessageCircleQuestion className="size-[18px] text-blue-800 dark:text-white" />
                }
              >
                <h1 className="font-medium ltr:text-2xl-ltr">
                  {t("guideline")}
                </h1>
                <h1 className="ltr:text-xl-ltr">{t("f_a_e_des")}</h1>
              </IconTooltip>
            </div>
          </li>

          {/* Data Row */}
          <li className="grid grid-cols-[1fr_1fr]">
            <div className="border">
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="health_worker"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("enter")}
                className="rtl:text-xl-rtl resize ltr:placeholder:text-xl-ltr rounded-none m-0 border-t border-x-0 border-b-0"
                tabsClassName="gap-0"
              >
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  english
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  farsi
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  pashto
                </SingleTab>
              </MultiTabTextarea>
            </div>
            <div className="border">
              <MultiTabTextarea
                optionalKey={"optional_lang"}
                onTabChanged={(key: string, tabName: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [key]: tabName,
                    optional_lang: tabName,
                  }));
                }}
                onChanged={(value: string, name: string) => {
                  setUserData((prev: any) => ({
                    ...prev,
                    [name]: value,
                  }));
                }}
                name="fin_admin_employees"
                highlightColor="bg-tertiary"
                userData={userData}
                errorData={error}
                placeholder={t("enter")}
                className="rtl:text-xl-rtl resize ltr:placeholder:text-xl-ltr rounded-none m-0 border-t border-x-0 border-b-0"
                tabsClassName="gap-0"
              >
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  english
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  farsi
                </SingleTab>
                <SingleTab className="rounded-none bg-transparent text-primary shadow-none border">
                  pashto
                </SingleTab>
              </MultiTabTextarea>
            </div>
          </li>
        </ul>
      </div>
      <PrimaryButton
        onClick={store}
        className="rtl:text-lg-rtl font-semibold ltr:text-md-ltr mx-auto col-span-full mt-8"
      >
        {editCenter ? (
          <>
            {t("save_changes")}
            <Save className="text-tertiary size-[18px]  transition mx-auto cursor-pointer" />
          </>
        ) : (
          <>
            {t("add_center_to_list")}{" "}
            <ChevronsDown className="text-tertiary size-[18px] animate-bounce transition mx-auto cursor-pointer" />
          </>
        )}
      </PrimaryButton>
    </div>
  );
}
