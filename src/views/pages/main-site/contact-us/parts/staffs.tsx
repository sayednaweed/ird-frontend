import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { useEffect, useState } from "react";
import axiosClient from "@/lib/axois-client";

import CachedImage from "@/components/custom-ui/image/CachedImage";
import { useTranslation } from "react-i18next";
import type { Staff } from "@/database/models";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { toast } from "sonner";
import { cn, formatPhoneNumber } from "@/lib/utils";
export interface StaffsProps {
  url: string;
  className?: string;
}
export default function Staffs(props: StaffsProps) {
  const { url, className } = props;
  const { t, i18n } = useTranslation();
  const [staffs, setStaffs] = useState<Staff[]>([]);

  const initialize = async () => {
    try {
      const response = await axiosClient.get(url);

      if (response.status === 200) {
        setStaffs(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
  };

  useEffect(() => {
    initialize();
  }, [i18n.language]);

  return (
    <div className={cn("relative rounded-xl overflow-auto p-4", className)}>
      <div className="grid justify-items-center -space-y-3 xxl:space-y-0 xxl:flex xxl:ltr:-space-x-3 xxl:rtl:-space-x-3 xxl:rtl:space-x-reverse">
        {staffs.length != 0 ? (
          staffs?.map((tech, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger>
                  <CachedImage
                    key={index}
                    src={tech.picture}
                    alt="Avatar"
                    shimmerClassName="size-20 hover:translate-y-2 transition-transform duration-300 shadow-lg border border-primary/30 rounded-full"
                    className=" size-20 hover:translate-y-2 transition-transform duration-300 object-center object-cover shadow-lg border border-primary rounded-full"
                    routeIdentifier={"public"}
                  />
                </TooltipTrigger>
                <TooltipContent className="p-2 grid place-items-center justify-items-start gap-y-1 grid-cols-[auto_1fr] w-[200px] xxl:w-full text-start gap-x-2">
                  <p className="font-semibold ltr:text-xl-ltr rtl:text-xl-rtl">
                    {t("name")}:
                  </p>
                  <p className="rtl:text-xl-rtl text-wrap break-words">
                    {tech.name}
                  </p>
                  <p className="font-semibold ltr:text-xl-ltr rtl:text-xl-rtl">
                    {t("job")}:
                  </p>
                  <p className="rtl:text-xl-rtl text-wrap break-words">
                    {tech.job}
                  </p>
                  <p className="font-semibold ltr:text-xl-ltr rtl:text-xl-rtl">
                    {t("contact")}:
                  </p>
                  <p
                    dir="ltr"
                    className="ltr:text-md rtl:text-sm-rtl font-normal text-wrap break-words"
                  >
                    {formatPhoneNumber(tech.contact)}
                  </p>
                  <p className="font-semibold ltr:text-xl-ltr rtl:text-xl-rtl">
                    {t("email")}:
                  </p>
                  <p className="ltr:text-md rtl:text-sm-rtl font-normal text-wrap break-all">
                    {tech.email}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        ) : (
          <Shimmer className="size-[86px] mx-auto shadow-lg border border-primary/30 rounded-full" />
        )}
      </div>
    </div>
  );
}
