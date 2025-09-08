import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import InfiniteScroll from "@/components/custom-ui/table/infinit-scroll";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import { useAuthStore } from "@/stores/auth/auth-store";

export default function DonorsPage() {
  useScrollToSingleElement("main-header-id");
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.token);
  const [error, setError] = useState<string | null>(null);

  const renderItem = useCallback((donor: any) => {
    return (
      <div className="group relative w-full rounded-xl overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center gap-4 p-4">
          <div className="relative w-14 h-14 shrink-0">
            <CachedImage
              src={donor?.profile}
              routeIdentifier={"profile"}
              shimmerClassName="w-14 h-14 rounded-full"
              className="w-14 h-14 rounded-full object-cover border"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold tracking-tight text-primary line-clamp-1">
              {donor?.name}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-1">@{donor?.username}</p>
            <div className="text-xs text-muted-foreground line-clamp-1">{donor?.email}</div>
          </div>
        </div>
        <div className="px-4 pb-4 flex items-center justify-between">
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] text-muted-foreground">
            {donor?.contact}
          </span>
        </div>
      </div>
    );
  }, []);

  const fetchItems = async (page: number, pageSize: number) => {
    if (!token) return [] as any[];
    try {
      setError(null);
      const res = await axiosClient.get("donors", {
        params: { page, per_page: pageSize },
      });
      // API shape: { donor: { data, ...pagination } }
      return res.data?.donor?.data ?? [];
    } catch (e: any) {
      setError(e?.response?.data?.message ?? t("something_went_wrong"));
      return [];
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
            <Shimmer className="h-3 w-3/4 rounded" />
          </div>
        </div>
      </div>
    ),
    []
  );

  if (!token) {
    return (
      <div className="px-4 md:px-8 xl:px-16 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl border bg-card shadow-sm p-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              {t("Donors")}
            </h1>
            <p className="text-muted-foreground mb-6">
              {t("You need to be signed in with proper permissions to view the donors list.")}
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                to="/auth/user/login"
                className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-white text-sm font-medium hover:bg-primary/90"
              >
                {t("Sign in as Staff")}
              </Link>
              <Link
                to="/auth/donor/login"
                className="inline-flex items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
              >
                {t("Sign in as Donor")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 xl:px-16 py-10">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {t("Donors")}
          </h1>
          {error && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </div>

        <InfiniteScroll<any>
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
