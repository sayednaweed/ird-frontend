import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import HeaderSection from "@/components/custom-ui/resuseable/header-section";
import { Separator } from "@/components/ui/separator";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import AchievementStatistics from "@/views/pages/main-site/about-us/parts/achievement-statistics";
import axiosClient from "@/lib/axois-client";
import { toast } from "sonner";
import OurObjectives from "@/views/pages/main-site/about-us/parts/our-objectives";

export default function AboutUsPage() {
  useScrollToSingleElement("main-header-id");
  const { t, i18n } = useTranslation();
  const [information, _setInformation] = useState<
    | {
        objectives: {
          our_values: {
            title: string;
            description: string;
          }[];
          our_mission: {
            title: string;
            description: string;
          }[];
        };
        achievements: {
          published: number;
          readers: number;
          experience: number;
          authors: number;
        };
      }
    | undefined
  >(undefined);
  const initialize = async () => {
    try {
      const response = await axiosClient.get(`about-us`);
      if (response.status === 200) {
        _setInformation(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
  };

  useEffect(() => {
    initialize();
  }, [i18n.language]);
  return (
    <>
      <HeaderSection description={t("app_desc")} title={t("app_quate")} />
      <AchievementStatistics data={information?.achievements} />
      <Separator />
      <OurObjectives data={information?.objectives} />
    </>
  );
}
