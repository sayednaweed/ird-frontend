import CachedImage from "@/components/custom-ui/image/CachedImage";
import type { News } from "@/database/models";
import { useOnScreen } from "@/hook/use-on-screen";
import { animated, useSpring } from "@react-spring/web";
import React from "react";
import { Link } from "react-router";
import { Tag, Calendar, Book, ArrowRight, Heart, Share2 } from "lucide-react";

interface NewsCardProps {
  news: News;
  delay: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, delay }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isVisible = useOnScreen(ref);
  const contentSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.9)" },
    to: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "scale(1)" : "scale(0.9)",
    },
    config: { duration: 400 },
    delay: delay, // stagger after image
  });

  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - el.left) / el.width; // 0..1
    const py = (e.clientY - el.top) / el.height; // 0..1
    const ry = (px - 0.5) * 6; // rotateY
    const rx = (py - 0.5) * -6; // rotateX
    setTilt({ rx, ry });
  };
  const onLeave = () => setTilt({ rx: 0, ry: 0 });

  const words = (news?.contents || "").trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.round(words / 200));

  return (
    <animated.div
      ref={ref}
      style={{
        ...contentSpring,
        transform: `${(contentSpring as any).transform?.get?.() || ''} perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="group relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-[4px] hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900 ring-1 ring-orange-100/40 dark:ring-orange-900/20"
    >
      {/* Artistic background layers (scoped to card) */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Soft grid texture */}
        <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.06] bg-[linear-gradient(to_right,rgba(100,116,139,0.13)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.13)_1px,transparent_1px)] bg-[size:18px_18px]" />
        {/* Corner orbs */}
        <div className="absolute -top-6 -left-6 h-28 w-28 rounded-full blur-2xl opacity-25 bg-[radial-gradient(closest-side,_rgba(251,146,60,0.5),_transparent_70%)]" />
        <div className="absolute -bottom-10 -right-10 h-36 w-36 rounded-full blur-3xl opacity-20 bg-[radial-gradient(closest-side,_rgba(251,191,36,0.45),_transparent_70%)]" />
        {/* Diagonal ribbon behind content */}
        <div className="absolute left-[-10%] right-[-10%] bottom-[18%] h-16 rotate-[-5deg] opacity-15 bg-gradient-to-r from-orange-200/60 via-orange-100/50 to-transparent dark:from-orange-900/35 dark:via-orange-800/25 dark:to-transparent" />
      </div>
      {/* Top gradient accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-300 opacity-90" />

      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <CachedImage
          src={news.image}
          routeIdentifier={"public"}
          shimmerClassName="absolute inset-0 w-full h-full object-cover"
          className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 ease-out group-hover:scale-[1.05]"
        />

        {/* Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_120%_-10%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

        {/* Quick meta on image */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {news.news_type && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/95 text-slate-900 shadow-sm ring-1 ring-slate-200">
              <Tag className="w-3 h-3" /> {news.news_type}
            </span>
          )}
          {news.date && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white backdrop-blur">
              <Calendar className="w-3 h-3" /> {new Date(news.date).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Action chips (top-right) */}
        <div className="absolute right-3 top-3 flex items-center gap-2">
          <button
            type="button"
            aria-label="Like"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-pink-600 shadow-sm ring-1 ring-slate-200 hover:bg-white transition"
          >
            <Heart className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            aria-label="Share"
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-white transition"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-5">
        {/* subtle glow on hover */}
        <div className="pointer-events-none absolute -inset-x-1 -top-10 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(30rem_10rem_at_50%_0%,theme(colors.violet.400/15),transparent)]" />

        <h3 className="relative z-10 text-[17px] font-semibold tracking-tight text-slate-900 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-slate-800">
          {news.title}
        </h3>
        <p className="relative z-10 text-[13px] leading-5 text-slate-600 dark:text-slate-300 line-clamp-3 mb-4">
          {news?.contents}
        </p>

        <div className="relative z-10 flex items-center justify-between">
          {/* Left: optional status/priority chip */}
          {news?.priority && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300/60 bg-amber-50 text-amber-700 px-3 py-1 text-[10px] font-medium dark:bg-amber-900/15 dark:text-amber-300 dark:border-amber-400/30">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
              {String(news.priority)}
            </span>
          )}

          {/* Right: Read more */}
          {news.id ? (
            <Link
              to={`/news/${news.id}`}
              className="inline-flex items-center gap-2 text-[12px] font-semibold text-white px-3 py-1.5 rounded-full bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 dark:focus:ring-slate-600"
            >
              <Book className="w-3.5 h-3.5" />
              <span>Read more</span>
              <ArrowRight className="w-3.5 h-3.5 translate-x-0 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span className="text-[12px] text-slate-500">Latest update</span>
          )}
        </div>

        {/* Meta footer */}
        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            {/* reading time */}
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
            {readMins} min read
          </span>
          {news?.created_at && (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
              {new Date(news.created_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/40 to-transparent" />
    </animated.div>
  );
};

export default NewsCard;
