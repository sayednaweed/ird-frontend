import SiteNavbar from "@/components/custom-ui/navbar/SiteNavbar";
import Footer from "@/views/pages/main-site/footer/footer";
import { Outlet } from "react-router";

export default function SiteLayout() {
  return (
    <div className="flex flex-col min-h-screen h-screen bg-card">
      <SiteNavbar />
      <main
        id="layout_parent"
        className="flex-grow overflow-auto flex-col flex justify-between"
      >
        <Outlet />
        <Footer />
      </main>
    </div>
  );
}
