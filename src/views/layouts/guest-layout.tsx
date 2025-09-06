import { Outlet } from "react-router";

export default function GuestLayout() {
  return (
    <section className="min-h-[100vh] max-h-[100vh] bg-secondary select-none">
      <Outlet />
    </section>
  );
}
