import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import HomeHeader from "@/views/pages/main-site/home/parts/home-header";
import HomeSection from "@/views/pages/main-site/home/parts/home-section";
import NewsCard from "@/views/pages/main-site/news/news-card";
import TrustedByDonors from "@/views/pages/main-site/donors/donors-slider";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth/auth-store";
import { Building2, DollarSign, CalendarRange, BadgeCheck } from "lucide-react";

interface NewsListItem {
  id: number;
  visible: number | boolean;
  date: string | null;
  visibility_date?: string | null;
  news_type_id: number;
  news_type: string;
  priority_id: number;
  priority: string;
  title: string;
  contents: string;
  image: string | null;
  created_at: string;
}

interface OrganizationListItem {
  id: number;
  abbr: string | null;
  status: string;
  name: string;
  type: string;
  director: string;
}

interface DonorListItem {
  id: number;
  profile: string | null;
  abbr: string | null;
  username: string;
  name: string; // localized name
  email: string;
  contact: string;
  created_at: string;
}

interface ProjectListItem {
  id: number;
  budget: number;
  start_date: string | null;
  end_date: string | null;
  donor_registration_no: string | null;
  project_name: string;
  donor: string;
  status: string;
  status_id: number;
  registration_no: string;
  currency: string;
  created_at: string;
}

export default function HomePage() {
  useScrollToSingleElement("main-header-id");
  const { t, i18n } = useTranslation();

  const [newsCache, setNewsCache] = useState<Record<string, NewsListItem[] | OrganizationListItem[] | DonorListItem[] | ProjectListItem[]>>({});

  const fetch = useCallback(async (url: string): Promise<{ failed: boolean; data: any[] }> => {
    try {
      const endpoint =
        url === "news"
          ? "news/public"
          : url === "featured-news"
            ? "news/public?featured=1"
            : url === "organizations" || url === "featured-organizations"
              ? "organizations/public"
              : url === "donors" || url === "featured-donors"
                ? "donors"
                : url === "projects" || url === "featured-projects"
                  ? url === "featured-projects"
                    ? "projects/public?featured=1"
                    : "projects/public"
                  : url;

      const cached = newsCache[url as keyof typeof newsCache];
      if (cached) {
        return { failed: false, data: cached };
      }
      const token = useAuthStore.getState().token;
      const isOrg = endpoint.startsWith("organizations/public");
      const isDonor = endpoint === "donors";
      const isProject = endpoint.startsWith("projects/public");
      const params = isOrg || isDonor || isProject ? { per_page: 12, page: 1 } : { _limit: 12, _page: 1 };
      const response = await axiosClient.get(endpoint, {
        params,
        withCredentials: isOrg || isProject ? false : axiosClient.defaults.withCredentials,
        headers: {
          ...(token && !isOrg && !isProject ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 200) {
        if (isOrg) {
          const list: any[] = response.data?.organizations?.data ?? [];
          setNewsCache((s) => ({ ...s, [url]: list }));
          return { failed: false, data: list };
        } else if (isDonor) {
          const list: any[] = response.data?.donor?.data ?? [];
          setNewsCache((s) => ({ ...s, [url]: list }));
          return { failed: false, data: list };
        } else if (isProject) {
          const list: any[] = response.data?.projects?.data ?? [];
          setNewsCache((s) => ({ ...s, [url]: list }));
          return { failed: false, data: list };
        } else if (Array.isArray(response.data)) {
          const normalized: NewsListItem[] = response.data.map((n: any) => ({
            ...n,
            image: n?.image ?? null,
          }));
          setNewsCache((s) => ({ ...s, [url]: normalized }));
          return { failed: false, data: normalized };
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
    return { failed: true, data: [] as any[] };
  }, [t, newsCache]);

  useEffect(() => {
    (async () => {
      if (!newsCache["news"]) {
        await fetch("news");
      }
      if (!newsCache["organizations"]) {
        await fetch("organizations");
      }
    })();
  }, [i18n.language]);

  const loader = (
    <Card className="m-0 p-0 rounded-md shadow max-h-[600px] gap-y-3 hover:-translate-y-1 transition-transform min-w-[300px] md:w-[320px] hover:shadow-lg duration-300 ease-out">
      <Shimmer className="p-0 h-[300px] sm:h-[300px] w-full" />
    </Card>
  );

  return (
    <>
      <HomeHeader />
      <section>
        <HomeSection<NewsListItem>
          title={t("News")}
          subTitle={t("view_all")}
          subTitleLink={"/news"}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "gap-6 py-4",
            },
          }}
          fetch={async (tab: string, url: string) => {
            const result = await fetch(url);
            return {
              tab: tab,
              data: result.data,
              failed: result.failed,
            };
          }}
          tabLList={[
            {
              name: "News",
              url: "news",
            },
            {
              name: "Featured News",
              url: "featured-news",
            },
          ]}
          shimmer={
            <>
              {loader}
              {loader}
              {loader}
            </>
          }
        >
          {(data) => (
            <NewsCard key={data.id} news={data as any} delay={50} />
          )}
        </HomeSection>
      </section>
      <section>
        <HomeSection<OrganizationListItem>
          title={t("Organizations")}
          subTitle={t("view_all")}
          subTitleLink={"/organizations"}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "gap-6 py-4",
            },
          }}
          fetch={async (tab: string, url: string) => {
            const result = await fetch(url);
            return {
              tab: tab,
              data: result.data,
              failed: result.failed,
            };
          }}
          tabLList={[
            {
              name: "Organizations",
              url: "organizations",
            },
            {
              name: "Featured Organizations",
              url: "featured-organizations",
            },
          ]}
          shimmer={
            <>
              {loader}
              {loader}
              {loader}
            </>
          }
        >
          {(data) => (
            <Card
              key={data.id}
              className="m-0 p-0 w-full rounded-md shadow relative min-h-[260px] gap-y-3 hover:-translate-y-1 transition-transform duration-300 ease-out"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold w-14 h-14">
                    {(data.abbr || data.name || "").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xl line-clamp-1">{data.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{data.type}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between px-6 pb-6">
                <span className="text-sm text-muted-foreground line-clamp-1">{t("Director")}: {data.director}</span>
                <span className="text-xs rounded-full bg-emerald-50 text-emerald-700 px-3 py-1">{data.status}</span>
              </CardFooter>
            </Card>
          )}
        </HomeSection>
      </section>
      <section>
        <HomeSection<DonorListItem>
          title={t("Donors")}
          subTitle={t("view_all")}
          subTitleLink={"/donors"}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "gap-6 py-4",
            },
          }}
          fetch={async (tab: string, url: string) => {
            const result = await fetch(url);
            return {
              tab: tab,
              data: result.data as DonorListItem[],
              failed: result.failed,
            };
          }}
          tabLList={[
            {
              name: "Donors",
              url: "donors",
            }
          ]}
          shimmer={<div className="h-24" />}
          renderAll={(list) => (
            <div className="col-span-full">
              <TrustedByDonors
                items={list.map((d) => ({ id: d.id, name: d.name, profile: d.profile }))}
                speedMs={10000}
              />
            </div>
          )}
        >
          {() => null}
        </HomeSection>
      </section>
      <section>
        <HomeSection<ProjectListItem>
          title={t("Projects")}
          subTitle={t("view_all")}
          subTitleLink={"/projects"}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "gap-6 py-4",
            },
          }}
          fetch={async (tab: string, url: string) => {
            const result = await fetch(url);
            return {
              tab: tab,
              data: result.data as ProjectListItem[],
              failed: result.failed,
            };
          }}
          tabLList={[
            {
              name: "Projects",
              url: "projects",
            },
            {
              name: "Featured Projects",
              url: "featured-projects",
            },
          ]}
          shimmer={
            <>
              {loader}
              {loader}
              {loader}
            </>
          }
        >
          {(data) => (
           <Card
           key={data.id}
           className="group relative w-full overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 min-h-[240px] transition-all duration-300 ease-out hover:shadow-xl hover:-translate-y-1"
         >
           {/* Top gradient strip (20%) */}
           <div className="absolute inset-x-0 top-0 h-[20%] bg-gradient-to-b from-slate-800 to-slate-600 rounded-t-2xl" />
         
           {/* Decorative subtle background pattern */}
           <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(45rem_20rem_at_120%_10%,_#94a3b8_15%,transparent_40%),radial-gradient(30rem_18rem_at_-10%_-10%,_#64748b_10%,transparent_40%)]" />
         
           {/* Hover glow accent */}
           <div className="pointer-events-none absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-40 transition duration-300 bg-[radial-gradient(40rem_18rem_at_50%_-10%,theme(colors.slate.400/20),transparent_60%)]" />
         
           <CardContent className="relative z-10 p-6">
             <div className="flex items-start justify-between gap-3">
               <div className="flex flex-col space-y-1 min-w-0">
                 <h3 className="font-semibold text-lg text-slate-900 tracking-tight line-clamp-1 group-hover:text-slate-800">
                   {data.project_name}
                 </h3>
                 <div className="flex items-center gap-2 text-[13px] text-slate-600 min-w-0">
                   <Building2 className="w-4 h-4 text-slate-500 shrink-0" />
                   <span className="truncate">{t("Donor")}: {data.donor}</span>
                 </div>
               </div>
               <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/90 text-amber-700 px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur-sm">
                 <BadgeCheck className="w-4 h-4" />
                 {data.status}
               </span>
             </div>
           </CardContent>
         
           <CardFooter className="relative z-10 flex items-center justify-between px-6 pb-6 pt-0 border-t border-slate-100">
             <span className="flex items-center gap-2 text-[13px] text-slate-700 min-w-0">
               <DollarSign className="w-4 h-4 text-slate-500 shrink-0" />
               <span className="truncate">
                 {t("Budget")}:{" "}
                 <span className="font-semibold text-slate-800">
                   {data.budget} {data.currency}
                 </span>
               </span>
             </span>
             <span className="flex items-center gap-2 text-[12px] text-slate-500">
               <CalendarRange className="w-4 h-4 shrink-0" />
               <span className="truncate">{data.start_date} → {data.end_date}</span>
             </span>
           </CardFooter>
         
           {/* Bottom glowing accent line */}
           <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-slate-400/50 to-transparent opacity-80" />
         </Card>
         
          )}
        </HomeSection>
      </section>
    </>
  );
}
