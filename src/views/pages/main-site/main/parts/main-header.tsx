import NavLink from "@/components/custom-ui/navbar/NavLink";
import { useMemo, type JSX } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
export const addresses = [
  "home",
  "news",
  "organizations",
  "about_us",
  "contact_us",
  "faqs",
];

export default function MainHeader() {
  const location = useLocation();
  const { i18n } = useTranslation();
  const link =
    location.pathname === "/" || location.pathname === "/home"
      ? "home"
      : location.pathname.slice(1);
  const sidebarComponents: JSX.Element[] = useMemo(() => {
    return addresses.map((item, index) => (
      <NavLink
        to={`/${item}`}
        key={index}
        time={index + 3}
        title={item}
        activeLink={link}
      />
    ));
  }, [location.pathname, i18n.language]);
  return (
    <>
      <div
        id="main-header-id"
        className="flex gap-x-6 md:gap-x-12 border-b max-w-screen overflow-x-auto py-3 md:py-[13px] px-4 xxl:px-8 md:px-16 whitespace-nowrap"
        style={{
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE 10+
        }}
      >
        {sidebarComponents}
      </div>
    </>
  );
}
