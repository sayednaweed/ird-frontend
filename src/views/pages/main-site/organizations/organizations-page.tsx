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
  logo?: string | null;
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
          <div className="flex items-center justify-center rounded-full bg-white text-primary font-semibold w-16 h-16 overflow-hidden ring-1 ring-slate-200">
            {o.logo ? (
              <img
                src={`${(import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "")}/${String(o.logo).replace(/^\/+/, "")}`}
                alt={o.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-slate-900 line-clamp-1">
              {o.name}
            </h3>
          </div>
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
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm p-5">
        <div className="flex items-center gap-4">
          <Shimmer className="w-16 h-16 rounded-full" />
          <div className="flex-1">
            <Shimmer className="h-4 w-2/3 rounded" />
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
