import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "react-i18next";
import StepTab from "./step-tab";
import type { ApprovalSearch, Order } from "@/lib/types";
import { useNavigate } from "react-router";

export interface DonorApprovalPageProps {
  pendingUrl: string;
  approvedUrl: string;
  rejectedUrl: string;
  filters: {
    order: Order;
    search: {
      column: ApprovalSearch;
      value: string;
    };
    mainTab: string | undefined;
    subTab: string;
  };
}

export default function ApprovalTab(props: DonorApprovalPageProps) {
  const { pendingUrl, approvedUrl, rejectedUrl, filters } = props;
  const { t, i18n } = useTranslation();
  const direction = i18n.dir();
  const navigate = useNavigate();

  const tabStyle =
    "border-0 cursor-pointer data-[state=active]:bg-tertiary/5 data-[state=active]:border-tertiary grow-0 text-muted-foreground transition-colors duration-300 data-[state=active]:font-semibold data-[state=active]:text-primary data-[state=active]:border-b-[2px] h-full rounded-none";
  const onTabChange = (tab: string) => {
    const queryParams = new URLSearchParams();
    queryParams.set("order", filters.order);
    queryParams.set("sch_col", filters.search.column);
    queryParams.set("sch_val", filters.search.value);
    queryParams.set("m_t", filters.mainTab ?? "unaurized");
    queryParams.set("s_t", tab);
    navigate(`/dashboard/approval?${queryParams.toString()}`, {
      replace: true,
    });
  };
  return (
    <Tabs
      dir={direction}
      className="border-t rounded-lg p-0 h-full space-y-0"
      value={filters.subTab}
      onValueChange={onTabChange}
    >
      <TabsList className="overflow-x-auto transition overflow-y-hidden bg-card w-full justify-start p-0 m-0 rounded-none">
        <TabsTrigger value="pending" className={tabStyle}>
          {t("pending")}
        </TabsTrigger>
        <TabsTrigger value="approved" className={tabStyle}>
          {t("approved")}
        </TabsTrigger>

        <TabsTrigger value="rejected" className={tabStyle}>
          {t("rejected")}
        </TabsTrigger>
      </TabsList>
      <TabsContent className="space-y-1" value="pending">
        <StepTab filters={filters} url={pendingUrl} />
      </TabsContent>
      <TabsContent className="space-y-1" value="approved">
        <StepTab filters={filters} url={approvedUrl} />
      </TabsContent>
      <TabsContent className="space-y-1" value="rejected">
        <StepTab filters={filters} url={rejectedUrl} />
      </TabsContent>
    </Tabs>
  );
}
