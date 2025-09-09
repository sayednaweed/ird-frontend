import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import InfiniteScroll from "@/components/custom-ui/table/infinit-scroll";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import type { Projects } from "@/database/models";
import { Building2, CalendarRange } from "lucide-react";

export default function ProjectsPage() {
  useScrollToSingleElement("main-header-id");
  const { t } = useTranslation();

  const renderItem = useCallback((p: Projects) => {
    return (
      <div className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-orange-100/40">
        {/* Artistic background layers (scoped) */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(45rem_20rem_at_120%_10%,_#fdba74_18%,transparent_40%),radial-gradient(30rem_18rem_at_-10%_-10%,_#f59e0b_14%,transparent_40%)]" />
        <div className="relative z-10 p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-semibold tracking-tight text-slate-900 line-clamp-2 group-hover:text-slate-800">
                {p.project_name}
              </h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 line-clamp-1">
                <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate">{t("Donor")}: {p.donor}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end text-xs text-slate-600">
            <span className="inline-flex items-center gap-2">
              <CalendarRange className="w-4 h-4 shrink-0" />
              <span className="truncate">{p.start_date} → {p.end_date}</span>
            </span>
          </div>
        </div>
        {/* Bottom glowing accent line */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent opacity-80" />
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
