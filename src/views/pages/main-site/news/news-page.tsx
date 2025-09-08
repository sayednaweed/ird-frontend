import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";
import HeaderSection from "@/components/custom-ui/resuseable/header-section";
import axiosClient from "@/lib/axois-client";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import InfiniteScroll from "@/components/custom-ui/table/infinit-scroll";
import type { News } from "@/database/models";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import NewsCard from "@/views/pages/main-site/news/news-card";

export default function NewsPage() {
  useScrollToSingleElement("main-header-id");
  const { t } = useTranslation();

  const renderItem = useCallback((news: News) => {
    return <NewsCard news={news} delay={50} />;
  }, []);
  const fetchItems = async (page: number, pageSize: number) => {
    try {
      const res = await axiosClient.get(
        `news/public?_limit=${pageSize}&_page=${page}`
      );
      return res.data as News[];
    } catch (e) {
      return [];
    }
  };
  const shimmer = useMemo(
    () => (
      <div className="rounded-xl overflow-hidden border bg-card shadow-sm">
        <div className="relative w-full aspect-[16/9]">
          <Shimmer className="absolute inset-0 w-full h-full" />
        </div>
        <div className="p-4 space-y-2">
          <Shimmer className="h-5 w-3/4 rounded" />
          <Shimmer className="h-4 w-full rounded" />
          <Shimmer className="h-4 w-5/6 rounded" />
        </div>
      </div>
    ),
    []
  );
  return (
    <>
      <HeaderSection
        description={t("faqs_title_des")}
        title={t("faqs_title")}
      />
      <InfiniteScroll<News>
        fetchData={fetchItems}
        renderItem={renderItem}
        scrollThreshold={120}
        shimmer={<>{shimmer}</>}
        style={{
          parentContainerClassName: "py-10 px-4 md:px-8 xl:px-16",
          containerClassName:
            "grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]",
        }}
        scrollableId="layout_parent"
      />
    </>
  );
}
