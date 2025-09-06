import AnimatedItem from "@/hook/animated-item";

export interface IHeaderSectionProps {
  description: string;
  title: string;
}

export default function HeaderSection(props: IHeaderSectionProps) {
  const { description, title } = props;
  return (
    <div className="relative min-h-[38vh] md:min-h-[50vh] lg:min-h-[60vh] bg-primary dark:bg-primary/5 bg-grid bg-grid-pattern text-white py-16 md:pb-24 md:pt-28 px-6 md:px-24">
      <div className="mx-auto">
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
          <h2 className="text-3xl relative md:text-5xl break-words leading-normal 2xl:text-7xl font-bold bg-gradient-to-r from-fourth to-fourth/70 text-transparent bg-clip-text block ">
            {title}
            <span className="absolute -top-3 rtl:right-0 ltr:left-0 h-0.5 bg-fourth px-6 md:px-24" />
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
          <p className="text-lg rtl:text-4xl-rtl text-white/90 leading-relaxed max-w-2xl">
            {description}
          </p>
        </AnimatedItem>
      </div>
    </div>
  );
}
