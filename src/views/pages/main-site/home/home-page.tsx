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
import { Building2, DollarSign, CalendarRange, BadgeCheck, Newspaper, Briefcase, Users, Sparkles } from "lucide-react";

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
  name: string;
  logo?: string | null;
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
          ? "newses/latest"
          : url === "featured-news"
            ? "newses/high"
            : url === "organizations"
              ? "organizations/latest"
              : url === "featured-organizations"
                ? "organizations/topprojects"
              : url === "donors" || url === "featured-donors"
                  ? "donors"
                  : url === "projects"
                    ? "projects/public/latest"
                    : url === "featured-projects"
                      ? "projects/public/topbudget"
                      : url;

      const cached = newsCache[url as keyof typeof newsCache];
      if (cached) {
        return { failed: false, data: cached };
      }
      const token = useAuthStore.getState().token;
      const isOrg = endpoint.startsWith("organizations/");
      const isDonor = endpoint === "donors";
      const isProject = endpoint.startsWith("projects/public");
      const isNewsPublic =
        endpoint === "news/public" ||
        endpoint.startsWith("newses/high") ||
        endpoint.startsWith("newses/latest");
      const params = isOrg
        ? {}
        : isProject
          ? {}
          : isDonor
            ? { per_page: 12, page: 1 }
            : (isNewsPublic ? {} : { _limit: 12, _page: 1 });
      const response = await axiosClient.get(endpoint, {
        params,
        withCredentials: isOrg || isProject || isNewsPublic ? false : axiosClient.defaults.withCredentials,
        headers: {
          'Accept-Language': i18n.language,
          ...(token && !isOrg && !isProject && !isNewsPublic ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.status === 200) {
        if (isOrg) {
          let list: any[] = response.data?.data?.organizations ?? [];
          if (Array.isArray(list) && list.length === 0 && i18n.language !== 'en') {
            const retry = await axiosClient.get(endpoint, {
              // Do not send pagination params on news endpoints during retry
              params: {},
              withCredentials: false,
              headers: { 'Accept-Language': 'en' },
            });
            list = retry.data?.data?.organizations ?? [];
          }
          const mapped: OrganizationListItem[] = list.map((o: any) => ({
            id: typeof o.id === 'number' ? o.id : 0,
            name: o.name ?? '',
            logo: o.logo ?? null,
          }));
          setNewsCache((s) => ({ ...s, [url]: mapped }));
          return { failed: false, data: mapped };
        } else if (isDonor) {
          const list: any[] = response.data?.donor?.data ?? [];
          setNewsCache((s) => ({ ...s, [url]: list }));
          return { failed: false, data: list };
        } else if (isProject) {
          const list: any[] = response.data?.projects?.data ?? [];
          setNewsCache((s) => ({ ...s, [url]: list }));
          return { failed: false, data: list };
        } else if (response.data?.newses && Array.isArray(response.data.newses)) {
          let list: any[] = Array.isArray(response.data.newses)
            ? (response.data.newses as any[])
            : Array.isArray((response.data as any)?.newses?.data)
              ? (response.data as any).newses.data
              : [];
          if (list.length === 0 && i18n.language !== 'en') {
            // retry with English as a safe fallback
            const retry = await axiosClient.get(endpoint, {
              // Do not send pagination params on news endpoints during retry
              params: {},
              withCredentials: false,
              headers: { 'Accept-Language': 'en' },
            });
            list = Array.isArray(retry.data?.newses)
              ? retry.data.newses
              : Array.isArray(retry.data?.newses?.data)
                ? retry.data.newses.data
                : [];
          }
          const mapped: NewsListItem[] = (list as any[]).map((n: any, idx: number) => {
            const priorityId = typeof n.priority === 'number' ? n.priority : 0;
            const priorityLabel = typeof n.priority === 'number'
              ? (n.priority === 1 ? 'High' : n.priority === 2 ? 'Medium' : n.priority === 3 ? 'Low' : String(n.priority))
              : (n.priority ?? '');
            return {
              // Provide a stable fallback id to avoid duplicate keys when backend omits id
              id: typeof n.id === 'number' ? n.id : 100000 + idx,
              visible: true,
              date: null,
              visibility_date: null,
              news_type_id: 0,
              news_type: '',
              priority_id: priorityId,
              priority: priorityLabel,
              title: n.title,
              contents: n.contents,
              image: n.image ?? null,
              created_at: '',
            } as NewsListItem;
          });
          setNewsCache((s) => ({ ...s, [url]: mapped }));
          return { failed: false, data: mapped };
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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-orange-50/45 to-white dark:from-slate-950 dark:via-orange-950/20 dark:to-slate-950">
      {/* Art background layers */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12] bg-[linear-gradient(to_right,rgba(0,0,0,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.08)_1px,transparent_1px)] bg-[size:22px_22px] dark:opacity-[0.1]" />
      {/* Top-right orb */}
      <div className="pointer-events-none absolute -top-16 -right-20 h-[640px] w-[640px] rounded-full blur-3xl opacity-45 bg-[radial-gradient(closest-side,_rgba(251,146,60,0.45),_transparent_100%)]" />
      {/* Bottom-left orb */}
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-[680px] w-[680px] rounded-full blur-3xl opacity-40 bg-[radial-gradient(closest-side,_rgba(251,191,36,0.4),_transparent_100%)]" />
      {/* Center subtle orb */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[420px] w-[420px] rounded-full blur-2xl opacity-25 bg-[radial-gradient(closest-side,_rgba(255,237,213,0.9),_transparent_70%)]" />
      {/* Diagonal ribbon */}
      <div className="pointer-events-none absolute -inset-x-10 top-1/2 -translate-y-1/2 h-[220px] rotate-[-6deg] opacity-25 bg-gradient-to-r from-orange-200/60 via-orange-100/60 to-transparent dark:from-orange-900/40 dark:via-orange-800/30 dark:to-transparent" />

      <div className="relative z-10">
        <HomeHeader />
        <section>
          <HomeSection<NewsListItem>
            icon={<Newspaper className="w-5 h-5" />}
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
            icon={<Building2 className="w-5 h-5" />}
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
                className="m-0 p-0 w-full rounded-md shadow relative min-h-[220px] gap-y-3 hover:-translate-y-1 transition-transform duration-300 ease-out"
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center rounded-full bg-primary/5 text-primary font-semibold w-16 h-16 overflow-hidden">
                      {data.logo ? (
                        <img
                          src={`${(import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "")}/${String(data.logo).replace(/^\/+/, "")}`}
                          alt={data.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{(data.name || "").substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-xl line-clamp-1">{data.name}</h3>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </HomeSection>
        </section>
        <section>
          <HomeSection<DonorListItem>
            icon={<Users className="w-5 h-5" />}
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
            icon={<Briefcase className="w-5 h-5" />}
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
                      {t("Budget")}: {" "}
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
      </div>
    </div>
  );
}
