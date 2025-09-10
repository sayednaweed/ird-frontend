import { useEffect } from "react";
import { useSpring, animated } from "@react-spring/web";
import CachedImage from "@/components/custom-ui/image/CachedImage";

export interface DonorLogoItem {
  id: number | string;
  name: string;
  profile: string | null;
}

interface TrustedByDonorsProps {
  items: DonorLogoItem[];
  speedMs?: number; // larger = slower
}

export default function TrustedByDonors({ items, speedMs = 1000 }: TrustedByDonorsProps) {
  const [styles, api] = useSpring(() => ({ from: { x: 0 }, to: { x: -100 }, loop: true, config: { duration: speedMs } }));

  useEffect(() => {
    api.start({ from: { x: 0 }, to: { x: -100 }, reset: true, loop: true, config: { duration: speedMs } });
  }, [api, speedMs]);

  const list = items && items.length ? items : [];
  const duplicated = [...list, ...list];

  return (
    <section className="w-full py-8 overflow-hidden">
      <div className="relative flex overflow-hidden rounded-2xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 ring-1 ring-slate-200/50 dark:ring-slate-800">
        {/* Edge fade masks */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white dark:from-slate-950 via-white/60 dark:via-slate-950/60 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white dark:from-slate-950 via-white/60 dark:via-slate-950/60 to-transparent z-10" />

        <animated.div
          className="flex items-center whitespace-nowrap will-change-transform hover:[animation-play-state:paused]"
          style={{ transform: styles.x.to((x) => `translateX(${x}%)`) }}
        >
          {duplicated.map((d, idx) => (
            <div
              key={`${d.id}-${idx}`}
              className="mx-10 h-28 w-[240px] flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <CachedImage
                  src={d.profile ?? undefined}
                  routeIdentifier="profile"
                  shimmerClassName="w-16 h-16 rounded-full"
                  className="w-16 h-16 object-cover rounded-full"
                  alt={d.name}
                />
              </div>
              <div className="mt-2 text-center">
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-1">
                  {d.name}
                </p>
              </div>
            </div>
          ))}
        </animated.div>
      </div>
    </section>
  );
}
