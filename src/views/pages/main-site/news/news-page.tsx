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
      <div className="shadow-lg flex flex-col col-span-full w-[94%] gap-y-2 pb-2 xxl:w-[320px] rounded-lg bg-transparent m-8 mx-auto">
        <Shimmer className="shadow-lg rounded-t-lg h-[200px] sm:h-[200px]" />
        <Shimmer className="h-7 rounded w-[90%] mx-auto" />
        <Shimmer className="h-20 rounded w-[90%] mx-auto" />
        <Shimmer className="h-7 rounded w-[90%] mx-auto" />
        <Shimmer className="h-7 rounded w-[90%] mx-auto" />
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
          parentContainerClassName: "py-40 px-20",
          containerClassName: "flex flex-wrap justify-center",
        }}
        scrollableId="layout_parent"
      />
    </>
  );
}
