import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface AppLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  imgClassName?: string;
  titleClassName?: string;
}

const AppLogo = React.forwardRef<HTMLDivElement, AppLogoProps>(
  (props, ref: any) => {
    const { className, imgClassName, titleClassName } = props;
    const { t } = useTranslation();

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-end gap-3 justify-self-start",
          className
        )}
      >
        <img
          className={cn("xxl:h-12 h-10", imgClassName)}
          src={`${import.meta.env.VITE_API_BASE_URL}/images/app-logo.png`}
          alt="logo"
        />
        <h1
          className={cn(
            "font-bold ltr:text-[14px] ltr:sm:text-3xl-ltr rtl:text-xl-rtl rtl:sm:text-4xl-rtl",
            titleClassName
          )}
        >
          {t("app_name")}
        </h1>
      </div>
    );
  }
);
export default AppLogo;
