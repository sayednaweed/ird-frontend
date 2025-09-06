import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import Burger from "../sidebar/Burger";
import ThemeSwitch from "@/components/custom-ui/navbar/theme-switch";
import ProfileDropdown from "@/components/custom-ui/navbar/profile-dropdown";
import Notifications from "@/components/custom-ui/navbar/notifications";

export default function DashboardNavbar() {
  const { loading, authenticated } = useGeneralAuthState();
  if (loading) return;
  return (
    <div
      className={`flex z-40 items-center ltr:pr-6 rtl:pl-4 py-1 border-b border-primary/5 bg--card backdrop-blur-[20px] sticky justify-end top-0 gap-x-1`}
    >
      {authenticated && (
        <>
          <Burger />
          <Notifications />
          <ProfileDropdown rootPath="/" />
        </>
      )}
      <ThemeSwitch />
    </div>
  );
}
