import CachedImage from "@/components/custom-ui/image/CachedImage";
import type { News } from "@/database/models";
import { useOnScreen } from "@/hook/use-on-screen";
import { animated, useSpring } from "@react-spring/web";
import React from "react";
import { Link } from "react-router";

interface NewsCardProps {
  news: News;
  delay: number;
}

const NewsCard: React.FC<NewsCardProps> = ({ news, delay }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const isVisible = useOnScreen(ref);
  const contentSpring = useSpring({
    from: { opacity: 0, transform: "scale(0.5)" },
    to: {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "scale(1)" : "scale(0.5)",
    },
    config: { duration: 400 },
    delay: delay, // stagger after image
  });

  return (
    <animated.div
      ref={ref}
      style={contentSpring}
      className="group relative w-full rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full aspect-[16/9] overflow-hidden">
        <CachedImage
          src={news.image}
          routeIdentifier={"public"}
          shimmerClassName="absolute inset-0 w-full h-full object-cover"
          className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {/* Bottom gradient overlay */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/40 to-transparent" />
        {/* Quick meta on image */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          {news.news_type && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/90 text-primary shadow-sm">
              {news.news_type}
            </span>
          )}
          {news.date && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-white/95">
              {new Date(news.date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-base font-semibold tracking-tight text-primary line-clamp-2 mb-1">
          {news.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {news?.contents}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {news.priority && (
              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
                {news.priority}
              </span>
            )}
          </div>
          <Link
            to={`/news/${news.id}`}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Read more
          </Link>
        </div>
      </div>
    </animated.div>
  );
};

export default NewsCard;
