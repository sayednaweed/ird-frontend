import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import AnimatedItem from "@/hook/animated-item";
import { useTranslation } from "react-i18next";

export interface OurObjectivesProps {
  data?: {
    our_values: {
      title: string;
      description: string;
    }[];
    our_mission: {
      description: string;
    }[];
  };
}
export default function OurObjectives(props: OurObjectivesProps) {
  const { data } = props;
  const { t } = useTranslation();

  return (
    <section className="grid lg:grid-cols-2 gap-12 px-2 sm:px-12 justify-center lg:justify-items-center py-52">
      <>
        <div className="md:space-y-2">
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
              },
              to: {
                opacity: 1,
              },
              config: {
                mass: 1,
                tension: 180,
                friction: 16,
              },
            }}
            intersectionArgs={{
              rootMargin: "-20% 0%",
              once: true,
            }}
          >
            <h1 className="font-bold text-4xl md:text-5xl text-primary md:mb-6">
              {t("our_mission")}
            </h1>
          </AnimatedItem>
          {data ? (
            data.our_mission.map(({ description }) => (
              <AnimatedItem
                key={description.slice(0, 6)}
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
                  rootMargin: "-10% 0%",
                  once: true,
                }}
              >
                <p className="text-md md:text-lg text-justify text-primary/70 text-wrap max-w-prose">
                  {description}
                </p>
              </AnimatedItem>
            ))
          ) : (
            <Shimmer className="h-10 md:mb-6" />
          )}
        </div>

        <div className="md:space-y-5">
          <AnimatedItem
            springProps={{
              from: {
                opacity: 0,
              },
              to: {
                opacity: 1,
              },
              config: {
                mass: 1,
                tension: 180,
                friction: 16,
              },
            }}
            intersectionArgs={{
              rootMargin: "-20% 0%",
              once: true,
            }}
          >
            <div className="font-bold text-4xl md:text-5xl text-primary md:mb-6">
              <h1 className="font-bold text-4xl md:text-5xl text-primary md:mb-6">
                {t("our_values")}
              </h1>
            </div>
          </AnimatedItem>
          {data ? (
            data.our_values.map(({ title, description }, index: number) => (
              <AnimatedItem
                key={title}
                springProps={{
                  from: {
                    opacity: 0,
                    y: 100,
                  },
                  to: {
                    opacity: 1,
                    y: 0,
                    delay: index * 100,
                  },
                  delay: index * 100,
                }}
                intersectionArgs={{
                  rootMargin: "-10% 0%",
                  once: true,
                }}
              >
                <>
                  <h1 className="font-semibold text-lg md:text-2xl mt-2 text-primary/90">
                    {title}
                  </h1>
                  <p className="text-md md:text-lg text-primary/70 text-wrap">
                    {description}
                  </p>
                </>
              </AnimatedItem>
            ))
          ) : (
            <>
              <Shimmer className="h-10 md:mb-6" />
              <Shimmer className="h-10 md:mb-6" />
              <Shimmer className="h-10 md:mb-6" />
            </>
          )}
        </div>
      </>
    </section>
  );
}
