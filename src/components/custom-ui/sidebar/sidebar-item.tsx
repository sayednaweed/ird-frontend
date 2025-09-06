import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import NetworkSvg from "@/components/custom-ui/image/NetworkSvg";
import type { UserPermission, SubPermission } from "@/database/models";
import AnimatedItem from "@/hook/animated-item";
import { useLocation } from "react-router";

export interface SidebarItemProps {
  path: string;
  permission: string;
  isActive: boolean;
  t: any;
  user_permission: UserPermission;
  navigateTo: (path: string) => void;
}

export function SidebarItem({
  isActive,
  navigateTo,
  user_permission,
  t,
  path,
  permission,
}: SidebarItemProps) {
  const location = useLocation();
  const urlParts = location.pathname.split("/");
  const selectedSubId = Number(urlParts[urlParts.length - 1]); // Convert to number
  const [categories, setCategories] = useState<SubPermission[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const subs = Array.from(user_permission.sub.values()).filter(
      (sub) => sub.is_category
    );
    setCategories(subs);

    const currentPath = window.location.pathname;
    const matched = subs.find((sub) =>
      currentPath.includes(`${path}/${sub.id}`)
    );

    if (matched) {
      setShowDropdown(true);
    }
  }, [user_permission.sub, path, location.pathname]);

  const handleClick = () => {
    if (categories.length === 0) {
      navigateTo(path);
    } else {
      setShowDropdown((prev) => !prev);
    }
  };

  const handleCategoryClick = (cat: SubPermission) => {
    navigateTo(`${path}/${cat.id}`);
  };

  return (
    <>
      <div
        onClick={handleClick}
        className={`flex justify-between items-center cursor-pointer py-[8px] mx-2 rounded-[8px] ${
          isActive
            ? "bg-blue-500/30 text-tertiary font-semibold ltr:text-lg-ltr rtl:text-3xl-rtl"
            : "hover:opacity-75 rtl:text-xl-rtl ltr:text-md-ltr"
        }`}
        key={permission}
      >
        <div className="flex gap-x-3 items-center w-full">
          <NetworkSvg src={user_permission.icon} routeIdentifier={"public"} />
          <h1 className="truncate">{t(permission)}</h1>
        </div>

        {categories.length > 0 && (
          <ChevronRight
            className={`size-[14px] text-white/70 ltr:mr-2 transition-transform duration-300 ease-in-out rtl:ml-2 ${
              showDropdown ? "rotate-90" : "rtl:rotate-180"
            }`}
          />
        )}
      </div>

      {showDropdown && categories.length > 0 && (
        <div className="relative ltr:ml-5 rtl:mr-5 mt-1 mb-4 space-y-1 ltr:pl-2 rtl:pr-2 before:absolute before:top-3 before:bottom-0 rtl:before:right-1 ltr:before:left-1 before:w-px rounded-full before:bg-tertiary/30">
          {categories.map((cat, index: number) => {
            const selected = selectedSubId === cat.id;
            return (
              <AnimatedItem
                key={cat.id}
                springProps={{
                  from: {
                    opacity: 0,
                    transform: "translateY(-8px)",
                  },
                  config: {
                    mass: 1,
                    tension: 210,
                    friction: 20,
                  },
                  to: {
                    opacity: 1,
                    transform: "translateY(0px)",

                    delay: index * 100,
                  },
                  delay: index * 100,
                }}
                intersectionArgs={{
                  rootMargin: "-10% 0%",
                  once: true,
                }}
              >
                <div className="relative flex items-center before:absolute ltr:before:left-1 rtl:before:right-1 before:top-1/2 before:w-3 before:h-px before:bg-tertiary/40">
                  <button
                    onClick={() => handleCategoryClick(cat)}
                    className={`cursor-pointer ltr:ml-5 rtl:mr-5 rtl:text-lg-rtl rtl:font-bold ltr:text-md-ltr flex items-center gap-x-2 py-1 px-2 w-[85%] rounded-sm transition-colors ${
                      selected
                        ? "font-semibold bg-blue-500/10 dark:text-primary"
                        : "hover:opacity-75 text-primary-foreground/85 dark:text-primary/75"
                    }`}
                  >
                    {t(cat.name)}
                  </button>
                </div>
              </AnimatedItem>
            );
          })}
        </div>
      )}
    </>
  );
}
