import TertiaryButton from "@/components/custom-ui/button/tertiary-button";
import { LanguageChanger } from "@/components/custom-ui/navbar/language-changer";
import Notifications from "@/components/custom-ui/navbar/notifications";
import ProfileDropdown from "@/components/custom-ui/navbar/profile-dropdown";
import ThemeSwitch from "@/components/custom-ui/navbar/theme-switch";
import AppLogo from "@/components/custom-ui/resuseable/app-logo";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";

export default function SiteNavbar() {
  const { loading, authenticated } = useGeneralAuthState();
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (loading) return;
  return (
    <div
      className={`flex items-center py-2 border-b border-primary/15 z-20 sticky top-0 justify-between`}
    >
      <AppLogo titleClassName="text-nowrap" />
      <div className="flex items-center gap-x-1 z-10 bg-card ltr:pr-6 rtl:pl-4 absolute rtl:left-2 ltr:right-2">
        {authenticated ? (
          <>
            <Notifications />
            <ProfileDropdown root={"dashboard"} rootPath="/dashboard" />
          </>
        ) : (
          <TertiaryButton
            className="gap-x-2 p-2 sm:px-4 sm:py-1"
            dir="ltr"
            onClick={() => navigate("/login")}
          >
            <LogOut className="size-[18px] rtl:rotate-180" />
            <h1 className="hidden sm:block">{t("login")}</h1>
          </TertiaryButton>
        )}
        <LanguageChanger />
        <ThemeSwitch />
      </div>
    </div>
  );
}
