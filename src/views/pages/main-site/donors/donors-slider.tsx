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
    <section className="w-full py-6 overflow-hidden">
      <div className="relative flex overflow-hidden">
        <animated.div
          className="flex items-center whitespace-nowrap"
          style={{ transform: styles.x.to((x) => `translateX(${x}%)`) }}
        >
          {duplicated.map((d, idx) => (
            <div
              key={`${d.id}-${idx}`}
              className="mx-8 h-24 w-56 flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-white shadow-sm bg-muted">
                <CachedImage
                  src={d.profile ?? undefined}
                  routeIdentifier="profile"
                  shimmerClassName="w-16 h-16 rounded-full"
                  className="w-16 h-16 object-cover"
                  alt={d.name}
                />
              </div>
              <div className="mt-2 text-sm text-slate-600 line-clamp-1 max-w-[12rem] text-center font-medium">
                {d.name}
              </div>
            </div>
          ))}
        </animated.div>
      </div>
    </section>
  );
}
