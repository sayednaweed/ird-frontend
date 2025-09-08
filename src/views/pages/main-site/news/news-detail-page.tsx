import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import axiosClient from "@/lib/axois-client";
import type { News } from "@/database/models";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";

export default function NewsDetailPage() {
  useScrollToSingleElement("main-header-id");
  const { id } = useParams();
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get(`public/news/${id}`, {
          // Public endpoint — do not send cookies
          withCredentials: false,
        });
        // backend returns { news: {...} }
        setNews(res.data?.news ?? null);
      } catch (e) {
        setNews(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) run();
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 md:px-8 xl:px-16 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
            <div className="relative w-full aspect-[16/9]">
              <Shimmer className="absolute inset-0 w-full h-full" />
            </div>
            <div className="p-6 space-y-3">
              <Shimmer className="h-7 w-3/4 rounded" />
              <Shimmer className="h-5 w-full rounded" />
              <Shimmer className="h-5 w-5/6 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!news) {
    return (
      <div className="px-4 md:px-8 xl:px-16 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-2">News not found</h2>
          <Link className="text-blue-600 hover:underline" to="/news">
            Back to News
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 xl:px-16 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-4">
          <Link to="/news" className="text-sm text-blue-600 hover:underline">
            ← Back to News
          </Link>
        </div>

        <article className="rounded-xl overflow-hidden border bg-card shadow-sm">
          <div className="relative w-full aspect-[16/9]">
            <CachedImage
              src={news.image}
              routeIdentifier="public"
              shimmerClassName="absolute inset-0 w-full h-full object-cover"
              className="absolute inset-0 w-full h-full object-cover"
              alt={news.title}
            />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {news.news_type && (
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {news.news_type}
                </span>
              )}
              {news.priority && (
                <span className="px-2 py-0.5 rounded-full border text-muted-foreground">
                  {news.priority}
                </span>
              )}
              {news.date && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {new Date(news.date).toLocaleDateString()}
                </span>
              )}
              {news.user && (
                <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {news.user}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {news.title}
            </h1>
            <p className="text-base leading-7 text-muted-foreground whitespace-pre-line">
              {news.contents}
            </p>
          </div>
        </article>
      </div>
    </div>
  );
}
