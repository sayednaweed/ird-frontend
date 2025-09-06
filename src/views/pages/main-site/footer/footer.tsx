import AppLogo from "@/components/custom-ui/resuseable/app-logo";
import axiosClient from "@/lib/axois-client";
import { addresses } from "@/views/pages/main-site/main/parts/main-header";
import { Mail, MapPin, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { formatPhoneNumber } from "@/lib/utils";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
type FooterPorps = {
  address: string;
  contact: string;
  email: string;
};

function Footer() {
  const [footer, setFooter] = useState<FooterPorps | undefined>(undefined);
  const { t, i18n } = useTranslation();

  const initialize = async () => {
    try {
      const response = await axiosClient.get(`about/office`);
      if (response.status === 200) {
        setFooter(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
  };

  useEffect(() => {
    initialize();
  }, [i18n.language]);

  return (
    <div className="bg-gradient-to-r from-gradient-dark-from to-gradient-dark-to from-0% to-100% dark:border-primary/5 border-t border-border/10">
      <div className="pb-6 pt-12 gap-x-12 gap-y-20 px-3 xxl:px-6 lg:px-20 sm:px-12 2xl:px-44 flex flex-col flex-wrap lg:grid lg:grid-cols-3 xl:grid-cols-4 grid-auto-flow-dense justify-start text-primary-foreground dark:bg-card dark:text-card-foreground">
        <div className="flex flex-col gap-y-4 xxl:gap-y-6 font-semibold">
          <AppLogo
            className="justify-start flex-col xxl:flex-row"
            imgClassName="xxl:h-16 h-12"
            titleClassName="ltr:!text-md"
          />
          <p className="leading-relaxed ltr:text-sm font-medium px-4 text-center xxl:ltr:text-left xxl:rtl:text-right text-primary-foreground/80 dark:text-card-foreground/90 text-wrap max-w-prose">
            {t("app_desc")}
          </p>
        </div>
        <div>
          <div
            className="col-span-full mb-4 relative font-bold text-white w-fit after:content-[''] 
            after:absolute 
            ltr:after:left-0 
            rtl:after:right-0 
            after:-top-1 
            after:w-10 
            after:h-[2px] 
            after:bg-fourth text-xl"
          >
            {t("social_media")}
            <div className="flex flex-wrap gap-4 mt-2">
              <Tooltip>
                <TooltipTrigger>
                  <svg
                    className=" fill-white hover:-translate-y-1 bg-white/5 hover:bg-transparent p-2 rounded-full transition-transform duration-150 ease-in-out"
                    width="42px"
                    height="42px"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2m13 2h-2.5A3.5 3.5 0 0 0 12 8.5V11h-2v3h2v7h3v-7h3v-3h-3V9a1 1 0 0 1 1-1h2V5z"></path>
                  </svg>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white/20 ">
                  <p>Facebook</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <svg
                    className=" fill-white hover:-translate-y-1 bg-white/5 hover:bg-transparent p-2 rounded-full transition-transform duration-150 ease-in-out"
                    width="42px"
                    height="42px"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                    ></path>
                  </svg>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white/20 ">
                  <p>X</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <svg
                    className=" fill-white hover:-translate-y-1 bg-white/5 hover:bg-transparent p-2 rounded-full transition-transform duration-150 ease-in-out"
                    width="42px"
                    height="42px"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
                    <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"></path>
                  </svg>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white/20 ">
                  <p>Youtube</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <svg
                    className=" fill-white hover:-translate-y-1 bg-white/5 hover:bg-transparent p-2 rounded-full transition-transform duration-150 ease-in-out"
                    width="42px"
                    height="42px"
                    focusable="false"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    data-testid="InstagramIcon"
                  >
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"></path>
                  </svg>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-white/20 ">
                  <p>Instagram</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-x-4 gap-y-2 font-semibold text-primary-foreground/80 dark:text-card-foreground/90">
          <h1
            className="col-span-full mb-4 relative font-bold text-white w-fit after:content-[''] 
            after:absolute 
            ltr:after:left-0 
            rtl:after:right-0 
            after:-top-1 
            after:w-10 
            after:h-[2px] 
            after:bg-fourth text-xl"
          >
            {t("quick_links")}
          </h1>

          {addresses.map((item, index) => (
            <Link
              to={`/${item}`}
              key={index}
              className="rtl:text-lg-rtl ltr:text-2xl-ltr font-medium rtl:pt-1 w-fit hover:translate-x-2 transition-transform duration-300 ease-in-out hover:text-fourth"
            >
              {t(item)}
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4 h-fit font-semibold text-primary-foreground/80 dark:text-card-foreground/90">
          <h1
            className="col-span-full mb-4 relative font-bold text-white w-fit after:content-[''] 
            after:absolute 
            ltr:after:left-0
            rtl:after:right-0 
            after:-top-1 
            after:w-10 
            after:h-[2px] 
            after:bg-fourth text-xl"
          >
            {t("contact_us")}
          </h1>

          {/* Address */}
          <MapPin className="size-[20px] text-fourth" />
          {footer ? (
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sehat-e-Ama+Square,+Wazir+Akbar+Khan+Road,+Kabul,+Afghanistan"
              target="_blank"
              rel="noopener noreferrer"
              className="ltr:text-sm rtl:text-xl-rtl font-medium tracking-wider w-fit"
            >
              {t("moph_address")}
            </a>
          ) : (
            <Shimmer className="h-6 rounded-[2px]" />
          )}

          {/* Email */}
          <Mail className="size-[20px] text-fourth" />
          {footer ? (
            <a
              href={`mailto:${footer?.email}`}
              className="ltr:text-sm break-all rtl:text-sm-rtl font-medium tracking-wider w-fit text-wrap"
            >
              {footer?.email}
            </a>
          ) : (
            <Shimmer className="h-6 rounded-[2px]" />
          )}

          {/* Phone */}
          <Phone className="size-[20px] break-all text-fourth" />
          {footer ? (
            <a
              dir="ltr"
              href={`tel:${footer?.contact}`}
              className="ltr:text-sm rtl:text-sm-rtl font-medium tracking-wider w-fit"
            >
              {formatPhoneNumber(footer?.contact)}
            </a>
          ) : (
            <Shimmer className="h-6 rounded-[2px]" />
          )}
        </div>
        {/* Powered By */}
        <div className="flex flex-col items-center xxl:flex-row gap-x-4 lg:items-center col-span-full mt-8">
          <p className="text-nowrap font-semibold rtl:text-xl-rtl">
            {t("powered_by")} :
          </p>
          <a
            className="rtl:text-sm rtl:font-semibold ltr:text-xs text-primary-foreground/80 dark:text-card-foreground/90"
            href="https://www.google.com/maps/search/?api=1&query=Sehat-e-Ama+Square,+Wazir+Akbar+Khan+Road,+Kabul,+Afghanistan"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("powered_by_des")}
          </a>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="text-center text-md-ltr md:text-lg-ltr py-4 text-primary-foreground/70 dark:bg-card dark:text-card-foreground dark:border-primary/5 border-t border-border/10">
        Copyright © 2025 | MOPH. All Rights Reserved
      </div>
    </div>
  );
}

export default Footer;
