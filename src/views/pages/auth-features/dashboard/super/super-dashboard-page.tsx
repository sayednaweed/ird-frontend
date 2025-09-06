import { ChartRadialShape } from "@/components/custom-ui/charts/radial/chart-radial-shape";
import ChartPieLabelList from "@/components/custom-ui/charts/pie/chart-pie-label-list";
import ChartBarInteractive from "@/components/custom-ui/charts/bar/chart-bar-interactive";
import { lazy } from "react";
const DashboardCards = lazy(
  () =>
    import("@/views/pages/auth-features/dashboard/super/parts/dashboard-cards")
);
export default function SuperDashboardPage() {
  return (
    <>
      {/* Cards */}
      <DashboardCards />
      {/* Charts */}
      <div className="flex flex-col sm:grid md:grid-cols-2 p-2 pb-16 gap-2">
        <ChartBarInteractive />
        <ChartRadialShape />
        <ChartPieLabelList />
      </div>
    </>
  );
}
