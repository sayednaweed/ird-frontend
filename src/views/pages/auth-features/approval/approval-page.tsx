import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import ApprovalTab from "./tabs/approval-tab";
import { useMemo } from "react";
import CustomSelect from "@/components/custom-ui/select/CustomSelect";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import { useUserAuthState } from "@/stores/auth/use-auth-store";
import type { UserPermission } from "@/database/models";
import { PermissionEnum } from "@/database/model-enums";
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbSeparator,
} from "@/components/custom-ui/breadcrumb/Breadcrumb";
import { CACHE } from "@/lib/constants";
import type { ApprovalSearch, Order } from "@/lib/types";

export default function ApprovalPage() {
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const { updateComponentCache, getComponentCache } = useCacheDB();
  const { user } = useUserAuthState();
  const [searchParams] = useSearchParams();
  // Accessing individual search filters
  const mainTab = searchParams.get("m_t");
  const subTab = searchParams.get("s_t");
  const searchValue = searchParams.get("sch_val");
  const searchColumn = searchParams.get("sch_col");
  const order = searchParams.get("order");
  const per: UserPermission = user?.permissions.get(
    PermissionEnum.approval.name
  ) as UserPermission;
  const filters = {
    order: order == null ? "desc" : (order as Order),
    search: {
      column:
        searchColumn == null ? "requester" : (searchColumn as ApprovalSearch),
      value: searchValue == null ? "" : searchValue,
    },
    mainTab:
      mainTab == null ? per.sub.values().next().value?.id.toString() : mainTab,
    subTab: subTab == null ? "pending" : subTab,
  };

  const tabStyle =
    "border-0 cursor-pointer data-[state=active]:bg-tertiary/5 data-[state=active]:border-tertiary grow-0 text-muted-foreground transition-colors duration-300 data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:border-b-[2px] h-full rounded-none";

  const tableList = useMemo(
    () =>
      Array.from(per.sub).map(([key, _subPermission], index: number) => {
        return key == PermissionEnum.approval.sub.user ? (
          <TabsTrigger key={index} value={key.toString()} className={tabStyle}>
            {t("user")}
          </TabsTrigger>
        ) : key == PermissionEnum.approval.sub.organization ? (
          <TabsTrigger key={index} value={key.toString()} className={tabStyle}>
            {t("organization")}
          </TabsTrigger>
        ) : key == PermissionEnum.approval.sub.donor ? (
          <TabsTrigger key={index} value={key.toString()} className={tabStyle}>
            {t("donor")}
          </TabsTrigger>
        ) : undefined;
      }),
    []
  );
  const navigate = useNavigate();
  const handleGoHome = () => navigate("/dashboard", { replace: true });
  const onTabChange = (tab: string) => {
    const queryParams = new URLSearchParams();
    queryParams.set("order", filters.order);
    queryParams.set("sch_col", filters.search.column);
    queryParams.set("sch_val", filters.search.value);
    queryParams.set("m_t", tab);
    queryParams.set("s_t", filters.subTab ?? "pending");
    navigate(`/dashboard/approval?${queryParams.toString()}`, {
      replace: true,
    });
  };
  return (
    <div className="p-2 pb-16 grid grid-cols-1 gap-y-1 relative select-none rtl:text-2xl-rtl ltr:text-xl-ltr">
      <Breadcrumb>
        <BreadcrumbHome onClick={handleGoHome} />
        <BreadcrumbSeparator />
        <BreadcrumbItem>{t("approval")}</BreadcrumbItem>
      </Breadcrumb>
      <CustomSelect
        paginationKey={CACHE.APPROVAL_TABLE_PAGINATION_COUNT}
        options={[
          { value: "10", label: "10" },
          { value: "20", label: "20" },
          { value: "50", label: "50" },
        ]}
        className="w-fit place-self-end"
        updateCache={updateComponentCache}
        getCache={async () =>
          await getComponentCache(CACHE.APPROVAL_TABLE_PAGINATION_COUNT)
        }
        placeholder={`${t("select")}...`}
        emptyPlaceholder={t("no_options_found")}
        rangePlaceholder={t("count")}
        onChange={async (_value: string) => {}}
      />
      <Tabs
        dir={direction}
        className="border p-0 h-fit gap-0"
        value={filters.mainTab}
        onValueChange={onTabChange}
      >
        <TabsList className="overflow-x-auto overflow-y-hidden bg-card w-full justify-start p-0 m-0 rounded-none">
          {tableList}
        </TabsList>
        <TabsContent value={PermissionEnum.approval.sub.user.toString()}>
          <ApprovalTab
            filters={filters}
            pendingUrl={"approvals/pending/users"}
            approvedUrl={"approvals/approved/users"}
            rejectedUrl={"approvals/rejected/users"}
          />
        </TabsContent>
        <TabsContent
          value={PermissionEnum.approval.sub.organization.toString()}
        >
          <ApprovalTab
            filters={filters}
            pendingUrl={"approvals/pending/organizations"}
            approvedUrl={"approvals/approved/organizations"}
            rejectedUrl={"approvals/rejected/organizations"}
          />
        </TabsContent>
        <TabsContent value={PermissionEnum.approval.sub.donor.toString()}>
          <ApprovalTab
            filters={filters}
            pendingUrl={"approvals/pending/donors"}
            approvedUrl={"approvals/approved/donors"}
            rejectedUrl={"approvals/approved/donors"}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
