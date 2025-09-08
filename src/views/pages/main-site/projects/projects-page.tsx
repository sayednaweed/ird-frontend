import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import InfiniteScroll from "@/components/custom-ui/table/infinit-scroll";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { Projects } from "@/database/models";

export default function ProjectsPage() {
  useScrollToSingleElement("main-header-id");
  const { t } = useTranslation();

  const renderItem = useCallback((p: Projects) => {
    return (
      <div className="group relative w-full rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-300">
        <div className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-primary line-clamp-2">
                {p.project_name}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {t("Donor")}: {p.donor}
              </p>
            </div>
            <span className="shrink-0 inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-medium">
              {p.status}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("Budget")}: {p.budget} {p.currency}
            </span>
            <span>
              {p.start_date} → {p.end_date}
            </span>
          </div>
        </div>
      </div>
    );
  }, [t]);

  const fetchItems = async (page: number, pageSize: number) => {
    try {
      const res = await axiosClient.get("projects/public", {
        params: { per_page: pageSize, page },
        withCredentials: false,
      });
      return (res.data?.projects?.data as Projects[]) ?? [];
    } catch (e) {
      return [] as Projects[];
    }
  };

  const shimmer = useMemo(
    () => (
      <div className="rounded-xl overflow-hidden border bg-card shadow-sm p-4">
        <div className="space-y-3">
          <Shimmer className="h-5 w-3/4 rounded" />
          <Shimmer className="h-4 w-5/6 rounded" />
          <div className="flex items-center justify-between">
            <Shimmer className="h-3 w-1/3 rounded" />
            <Shimmer className="h-3 w-1/3 rounded" />
          </div>
        </div>
      </div>
    ),
    []
  );

  return (
    <div className="px-4 md:px-8 xl:px-16 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("Projects")}
          </h1>
        </div>

        <InfiniteScroll<Projects>
          fetchData={fetchItems}
          renderItem={renderItem}
          scrollThreshold={120}
          shimmer={<>{shimmer}</>}
          style={{
            parentContainerClassName: "",
            containerClassName:
              "grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]",
          }}
          scrollableId="layout_parent"
        />
      </div>
    </div>
  );
}
