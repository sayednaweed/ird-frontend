import DashboardCard from "@/components/custom-ui/resuseable/dashboard-card";
import { BarChart2, PersonStanding } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function DashboardCards() {
  const { t } = useTranslation();

  return (
    <div className="p-2 md:px-20 grid grid-cols-1 xxl:grid-cols-2 gap-2 md:grid-cols-4">
      <DashboardCard
        loading={false}
        key={"country"}
        title={t("country")}
        description={t("january")}
        className="overflow-hidden flex-1 space-y-2 h-full p-4"
        value={100}
        symbol="+"
        icon={
          <BarChart2 className="sm:size-[54px] min-w-[32px] min-h-[32px]" />
        }
      />
      <DashboardCard
        loading={false}
        key={"district"}
        title={t("district")}
        description={t("january")}
        className="overflow-hidden flex-1 space-y-2 h-full p-4"
        value={20000}
        symbol="+"
        icon={
          <BarChart2 className="sm:size-[54px] min-w-[32px] min-h-[32px]" />
        }
      />
      <DashboardCard
        loading={false}
        key={"area"}
        title={t("area")}
        description={t("area")}
        className="overflow-hidden flex-1 space-y-2 h-full p-4"
        value={566000}
        symbol="+"
        icon={
          <BarChart2 className="sm:size-[54px] min-w-[32px] min-h-[32px]" />
        }
      />
      <DashboardCard
        loading={false}
        key={"job"}
        title={t("job")}
        description={t("job")}
        className="overflow-hidden flex-1 space-y-2 h-full p-4"
        value={600}
        symbol="+"
        icon={
          <PersonStanding className="sm:size-[54px] min-w-[32px] min-h-[32px]" />
        }
      />
    </div>
  );
}
