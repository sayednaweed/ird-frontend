import AchievementCounter from "@/components/custom-ui/resuseable/achievement-counter";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import AnimatedItem from "@/hook/animated-item";
import { House, HousePlus, TrainFront, TrendingUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface AchievementStatisticsProps {
  data?: {
    published: number;
    readers: number;
    experience: number;
    authors: number;
  };
}
export default function AchievementStatistics(
  props: AchievementStatisticsProps
) {
  const { data } = props;
  const { t } = useTranslation();
  const loader = (
    <div className="flex flex-col items-center gap-y-2">
      <Shimmer className="size-10 rounded-sm" />
      <Shimmer className="h-10 w-32 rounded-sm" />
      <Shimmer className="h-8 w-32 rounded-sm" />
      <Shimmer className="h-6 w-32 rounded-sm" />
    </div>
  );
  return (
    <section className="flex flex-col md:flex-row items-center md:items-start md:justify-around py-52 px-4 md:px-16 flex-wrap gap-x-4 gap-y-32">
      {data ? (
        <>
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
                y: 100,
              },
              to: {
                opacity: 1,
                y: 0,
              },
            }}
            intersectionArgs={{
              rootMargin: "-20% 0%",
              once: true,
            }}
          >
            {(inView) => (
              <AchievementCounter
                total={inView ? data.published : null}
                loading={data == undefined}
                title={t("ngos")}
                symbol="+"
                description={t("ngos_des")}
                icon={<House className=" size-12 rounded-sm p-1 text-fourth" />}
              />
            )}
          </AnimatedItem>
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
                y: 100,
              },
              to: {
                opacity: 1,
                y: 0,
                delay: 100,
              },
              delay: 100,
            }}
            intersectionArgs={{
              rootMargin: "-20% 0%",
              once: true,
            }}
          >
            {(inView) => (
              <AchievementCounter
                total={inView ? data.readers : null}
                loading={data == undefined}
                title={t("foundations")}
                symbol="+"
                description={t("foundations_des")}
                icon={
                  <HousePlus className=" size-12 rounded-sm p-1 text-fourth" />
                }
              />
            )}
          </AnimatedItem>
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
                y: 100,
              },
              to: {
                opacity: 1,
                y: 0,
                delay: 150,
              },
              delay: 150,
            }}
            intersectionArgs={{
              rootMargin: "-20% 0%",
              once: true,
            }}
          >
            {(inView) => (
              <AchievementCounter
                total={inView ? data.experience : null}
                loading={data == undefined}
                title={t("donors")}
                symbol="+"
                description={t("donors_des")}
                icon={
                  <TrainFront className=" size-12 rounded-sm p-1 text-fourth" />
                }
              />
            )}
          </AnimatedItem>
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
                y: 100,
              },
              to: {
                opacity: 1,
                y: 0,
                delay: 200,
              },
              delay: 200,
            }}
            intersectionArgs={{
              rootMargin: "-20% 0%",
              once: true,
            }}
          >
            {(inView) => (
              <AchievementCounter
                total={inView ? data.authors : null}
                loading={data == undefined}
                title={t("projects")}
                symbol="+"
                description={t("projects_des")}
                icon={
                  <TrendingUp className=" size-12 rounded-sm p-1 text-fourth" />
                }
              />
            )}
          </AnimatedItem>
        </>
      ) : (
        <>
          {loader}
          {loader}
          {loader}
          {loader}
        </>
      )}
    </section>
  );
}
