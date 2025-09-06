import DashboardNavbar from "@/components/custom-ui/navbar/dashboard-navbar";
import NastranSidebar from "@/components/custom-ui/sidebar/NastranSidebar";
import { Outlet } from "react-router";

export default function AuthLayout() {
  return (
    <section className="min-h-[100vh] max-h-[100vh] flex bg-secondary select-none">
      <NastranSidebar />
      <main className="min-h-full flex-1 flex flex-col overflow-auto">
        <DashboardNavbar />
        <Outlet />
      </main>
    </section>
  );
}
