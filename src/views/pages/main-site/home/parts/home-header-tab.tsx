import TertiaryButton from "@/components/custom-ui/button/tertiary-button";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import AnimatedItem from "@/hook/animated-item";
import { useTranslation } from "react-i18next";

export interface HomeHeaderItemProps {
  title: string;
  image: string;
  description: string;
}

export function HomeHeaderTab(props: HomeHeaderItemProps) {
  const { title, image, description } = props;
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-y-4 items-center lg:items-start mb-12 lg:mb-0 z-10">
      <AnimatedItem
        springProps={{
          from: {
            opacity: 0,
          },
          to: {
            opacity: 1,
          },
          config: {
            mass: 15,
            friction: 220,
            tension: 222,
          },
        }}
        intersectionArgs={{
          rootMargin: "-5% 0%",
          once: true,
        }}
      >
        <h2 className="text-xl sm:text-2xl lg:text-4xl relative text-center lg:text-start font-bold leading-tight break-words line-clamp-3 bg-gradient-to-r from-fourth to-fourth/70 text-transparent bg-clip-text">
          {title}
          <span className="absolute hidden lg:block -top-3 rtl:right-0 ltr:left-0 h-0.5 bg-fourth px-6 md:px-24" />
        </h2>
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
          },
        }}
        intersectionArgs={{
          rootMargin: "-5% 0%",
          once: true,
        }}
      >
        <p className="text-md sm:text-lg text-white/90 text-center lg:text-start line-clamp-6 leading-relaxed max-w-xl">
          {description}
        </p>
      </AnimatedItem>

      <TertiaryButton className="gap-x-2 px-8 py-2 font-semibold capitalize ltr:text-3xl-ltr rtl:text-4xl-rtl mt-16">
        {t("view_detail")}
      </TertiaryButton>
      <div
        className="-order-1 mb-2 lg:mb-20 w-[80%] xxl:w-[40%] sm:w-[350px] sm:h-[450px] xl:h-[500px] xl:w-[400px] lg:[transform:perspective(1000px)_rotateY(-12deg)] lg:absolute lg:translate-x-0 lg:top-1/2 lg:-translate-y-1/2 rtl:left-1/2 rtl:lg:left-[5%] rtl:xl:left-[10%] ltr:lg:right-[5%] ltr:xl:right-[10%] z-10
          xxl:p-6 p-3 bg-white/10 backdrop-blur-md backdrop-saturate-150 rounded-xl flex justify-center items-center"
      >
        <CachedImage
          src={image}
          shimmerClassName="hover:scale-105 transition-transform w-full h-full"
          className="hover:scale-105 transition-transform w-full h-full"
          routeIdentifier="public"
        />
      </div>
    </div>
  );
}
