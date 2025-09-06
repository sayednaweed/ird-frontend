import MainHeader from "@/views/pages/main-site/main/parts/main-header";
import { Outlet } from "react-router";

export default function MainPage() {
  return (
    <section>
      <MainHeader />
      <Outlet />
    </section>
  );
}
