import CachedImage from "@/components/custom-ui/image/CachedImage";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import HomeHeader from "@/views/pages/main-site/home/parts/home-header";
import HomeSection from "@/views/pages/main-site/home/parts/home-section";
import { ChevronsRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth/auth-store";

// Matches backend response shape from NewsController::publicNewses
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

// Matches backend response from ViewsOrganizationController::publicOrganizations
interface OrganizationListItem {
  id: number;
  abbr: string | null;
  status: string;
  name: string;
  type: string;
  director: string;
}

// Matches DonorController::index paginator shape (key: donor)
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

// Matches ViewProjectController::index paginator shape (key: projects)
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
          ? "projects"
          : url;

      const cached = newsCache[url as keyof typeof newsCache];
      if (cached) {
        return { failed: false, data: cached };
      }
      const token = useAuthStore.getState().token;
      const isOrg = endpoint.startsWith("organizations/public");
      const isDonor = endpoint === "donors";
      const isProject = endpoint === "projects";
      const params = isOrg || isDonor || isProject ? { per_page: 12, page: 1 } : { _limit: 12, _page: 1 };
      const response = await axiosClient.get(endpoint, { params, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });

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
          subTitleLink={""}
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
            <Card
              key={data.id}
              className="m-0 p-0 w-full rounded-md shadow relative min-h-[500px] max-h-[500px] gap-y-3 hover:-translate-y-1 transition-transform duration-300 ease-out"
            >
              <CardContent className="p-0 h-[300px] sm:h-[300px]">
                <CachedImage
                  src={
                    data.image
                      ? data.image.startsWith("images/")
                        ? `${import.meta.env.VITE_API_BASE_URL}/${data.image}`
                        : data.image
                      : undefined
                  }
                  routeIdentifier={
                    data.image && !data.image.startsWith("images/")
                      ? "public"
                      : undefined
                  }
                  shimmerClassName="min-w-full h-full object-fill rounded-t-md"
                  className="min-w-full shadow-lg h-full object-fill rounded-t-md"
                />
              </CardContent>
              <CardFooter className="flex flex-col justify-start items-start gap-y-2 pb-6">
                <h2 className="font-bold rtl:text-lg-rtl max-w-full ltr:text-2xl-ltr line-clamp-2">
                  {data.title}
                </h2>
                <h1 className="rtl:text-lg-rtl ltr:text-xl-ltr max-w-full text-primary/95 line-clamp-3 px-2">
                  {data.contents}
                </h1>
                <div className="flex items-center select-none absolute bottom-4 ltr:pt-2 gap-x-2 hover:ltr:translate-x-3 hover:rtl:-translate-x-3 transition-transform ease-in-out cursor-pointer">
                  <h1 className="rtl:text-2xl-rtl max-w-full ltr:text-xl-ltr">
                    {t("view")}
                  </h1>
                  <ChevronsRight className="text-green-500 cursor-pointer rtl:rotate-180 hover:text-green-500/70 size-[18px] transition" />
                </div>
              </CardFooter>
            </Card>
          )}
        </HomeSection>
      </section>
      <section>
        <HomeSection<OrganizationListItem>
          title={t("Organizations")}
          subTitle={t("view_all")}
          subTitleLink={""}
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
          subTitleLink={""}
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
            },
            {
              name: "Featured Donors",
              url: "featured-donors",
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
                  <div className="flex items-center justify-center rounded-full bg-primary/10 text-primary font-semibold w-14 h-14">
                    {(data.abbr || data.name || data.username || "").substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xl line-clamp-1">{data.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{data.email}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between px-6 pb-6">
                <span className="text-sm text-muted-foreground line-clamp-1">{t("Contact")}: {data.contact}</span>
                <span className="text-xs rounded-full bg-blue-50 text-blue-700 px-3 py-1">{data.username}</span>
              </CardFooter>
            </Card>
          )}
        </HomeSection>
      </section>
      <section>
        <HomeSection<ProjectListItem>
          title={t("Projects")}
          subTitle={t("view_all")}
          subTitleLink={""}
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
              className="m-0 p-0 w-full rounded-md shadow relative min-h-[220px] gap-y-3 hover:-translate-y-1 transition-transform duration-300 ease-out"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xl line-clamp-1">{data.project_name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{t("Donor")}: {data.donor}</p>
                  </div>
                  <span className="text-xs rounded-full bg-amber-50 text-amber-700 px-3 py-1">{data.status}</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between px-6 pb-6">
                <span className="text-sm text-muted-foreground line-clamp-1">{t("Budget")}: {data.budget} {data.currency}</span>
                <span className="text-xs text-muted-foreground line-clamp-1">{data.start_date} → {data.end_date}</span>
              </CardFooter>
            </Card>
          )}
        </HomeSection>
      </section>
    </>
  );
}
