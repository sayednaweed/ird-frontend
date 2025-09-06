import CachedImage from "@/components/custom-ui/image/CachedImage";
import type { News } from "@/database/models";
import { useOnScreen } from "@/hook/use-on-screen";
import { animated, useSpring } from "@react-spring/web";
import React from "react";

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
      className="w-60 p-4 pb-10 relative border h-[340px] rounded-md shadow hover:shadow-lg transition"
    >
      <div className="relative">
        <CachedImage
          src={news.image}
          shimmerClassName="min-w-full h-full object-cover h-[200px] rounded-t-lg sm:h-[200px]"
          className="min-w-full shadow-lg object-cover rounded-t-lg h-[200px] sm:h-[200px]"
          routeIdentifier={"public"}
        />
      </div>
      <h3 className="text-start font-semibold text-primary mb-1 line-clamp-2">
        {news.title}
      </h3>
      <div className="text-sm text-primary/80 text-start mb-1 line-clamp-3">
        {news?.contents}
      </div>

      <a
        href={""}
        className="inline-block text-blue-600 font-medium hover:underline absolute bottom-3 text-sm"
      >
        Learn More →
      </a>
    </animated.div>
  );
};

export default NewsCard;
