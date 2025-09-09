import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import InfiniteScroll from "@/components/custom-ui/table/infinit-scroll";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";

interface OrganizationListItem {
  id: number;
  abbr: string | null;
  status: string;
  name: string;
  type: string;
  director: string;
}

export default function OrganizationsPage() {
  useScrollToSingleElement("main-header-id");
  const { t } = useTranslation();

  const renderItem = useCallback((o: OrganizationListItem) => {
    const initials = (o.abbr || o.name || "").substring(0, 2).toUpperCase();
    return (
      <div className="group relative w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 ring-1 ring-orange-100/40">
        {/* Artistic background layers (scoped) */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(40rem_18rem_at_120%_10%,_#fdba74_18%,transparent_45%),radial-gradient(28rem_16rem_at_-10%_-10%,_#f59e0b_14%,transparent_45%)]" />
        <div className="p-5 flex items-center gap-4 relative z-10">
          <div className="flex items-center justify-center rounded-full bg-white text-primary font-semibold w-14 h-14 ring-1 ring-slate-200">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-primary line-clamp-1">
              {o.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{o.type}</p>
          </div>
          <span className="ml-auto shrink-0 inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-medium shadow-sm">
            {o.status}
          </span>
        </div>
        <div className="px-5 pb-5 text-xs text-muted-foreground relative z-10">
          {t("Director")}: {o.director}
        </div>
      </div>
    );
  }, [t]);

  const fetchItems = async (page: number, pageSize: number) => {
    try {
      const res = await axiosClient.get("organizations/public", {
        params: { per_page: pageSize, page },
        withCredentials: false,
      });
      return (res.data?.organizations?.data as OrganizationListItem[]) ?? [];
    } catch (e) {
      return [] as OrganizationListItem[];
    }
  };

  const shimmer = useMemo(
    () => (
      <div className="rounded-xl overflow-hidden border bg-card shadow-sm p-4">
        <div className="flex items-center gap-4">
          <Shimmer className="w-14 h-14 rounded-full" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-2/3 rounded" />
            <Shimmer className="h-3 w-1/2 rounded" />
          </div>
          <Shimmer className="h-4 w-16 rounded" />
        </div>
        <div className="px-0 pt-3">
          <Shimmer className="h-3 w-1/3 rounded" />
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
            {t("Organizations")}
          </h1>
        </div>

        <InfiniteScroll<OrganizationListItem>
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
