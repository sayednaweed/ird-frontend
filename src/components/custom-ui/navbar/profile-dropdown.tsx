import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import { useGeneralAuthState } from "@/stores/auth/use-auth-store";
import { RoleEnum } from "@/database/model-enums";

export interface ProfileDropdownProps {
  root?: string;
  rootPath: string;
}
function ProfileDropdown(props: ProfileDropdownProps) {
  const { root, rootPath } = props;
  const { user, logoutUser, logoutOrganization, logoutDonor } =
    useGeneralAuthState();
  const navigate = useNavigate();
  const { t } = useTranslation();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="cursor-pointer ">
        <div className="relative">
          <CachedImage
            src={user?.profile}
            alt="Avatar"
            ShimmerIconClassName="size-[18px]"
            shimmerClassName="size-[36px] ltr:mr-8 rtl:ml-8 border bg-card rounded-full size-[36px] select-none"
            className="size-[36px] ltr:mr-8 rtl:ml-8 object-center object-cover shadow-lg rounded-full"
            routeIdentifier={"profile"}
          />
          <span className="absolute bottom-0 rtl:right-6 ltr:left-6 size-[9px] bg-green-400 border-[2px] border-card rounded-full" />
          <span className="absolute bottom-[1px] rtl:right-[25px] ltr:left-[25px] size-[8px] animate-ping border-green-400 border-[1px] rounded-full" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-20 rtl:text-end">
        <DropdownMenuLabel>
          <h1 className="rtl:text-md-rtl ltr:text-xs font-semibold">
            {t("signed_in_as")}
          </h1>
          <h1 className="text-[14px] line-clamp-1 max-w-44 truncate">
            {user?.username}
          </h1>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer rtl:text-md-rtl ltr:text-xs rtl:font-semibold"
          onClick={async () => navigate("/dashboard/profile")}
        >
          {t("profile")}
          <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        {root && (
          <DropdownMenuItem
            className="cursor-pointer rtl:text-md-rtl ltr:text-xs rtl:font-semibold"
            onClick={async () => navigate(rootPath)}
          >
            {t(root)}
            <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="cursor-pointer rtl:text-md-rtl ltr:text-xs rtl:font-semibold"
          onClick={async () => {
            if (user.role.role == RoleEnum.organization) {
              await logoutOrganization();
              navigate("/auth/organization/login", { replace: true });
            } else if (user.role.role == RoleEnum.donor) {
              await logoutDonor();
              navigate("/auth/donor/login", { replace: true });
            } else {
              await logoutUser();
              navigate("/auth/user/login", { replace: true });
            }
          }}
        >
          {t("log_out")}
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export default memo(ProfileDropdown);
