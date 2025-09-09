import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";

export interface HomeSectionProps<T> {
  title: string;
  subTitle: string;
  subTitleLink: string;
  fetch: (
    tab: string,
    url: string
  ) => Promise<{ data: T[]; tab: string; failed: boolean }>;
  children: (data: T) => React.ReactNode;
  renderAll?: (list: T[]) => React.ReactNode;
  tabLList: {
    name: string;
    url: string;
  }[];
  style?: {
    tab?: { className: string };
    tabList?: { className: string };
    tabTrigger?: { className: string };
    tabContent?: { className: string };
  };
  className?: string;
  shimmer?: React.ReactNode;
}

export default function HomeSection<T>(props: HomeSectionProps<T>) {
  const [tab, setTab] = useState("");
  const [failed, setFaild] = useState(false);
  const { t } = useTranslation();

  const [list, setList] = useState<T[] | undefined>(undefined);
  const {
    subTitle,
    title,
    subTitleLink,
    children,
    renderAll,
    tabLList,
    fetch,
    style,
    shimmer,
    className,
  } = props;
  const { i18n } = useTranslation();

  useEffect(() => {
    if (tabLList.length > 0) {
      onTabClick(tabLList[0].name, tabLList[0].url);
    }
  }, [i18n.language]);
  const tabStyle = `
  relative inline-flex items-center
  px-3 py-1.5 rounded-full text-[13px] font-semibold
  text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
  transition-all duration-200
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-slate-400
  data-[state=active]:text-white data-[state=active]:shadow
  data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-800 data-[state=active]:to-slate-700
  whitespace-nowrap
`;
  const onTabClick = async (tab: string, url: string) => {
    const data = await fetch(tab, url);
    console.debug("HomeSection fetch", { tab, url, failed: data.failed, count: Array.isArray(data.data) ? data.data.length : null });
    setList(data.data);
    setFaild(!!data.failed);
    setTab(tab);
  };

  const tabContentStyle = cn(
    "grid gap-6 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]",
    style?.tabContent?.className
  );
  const tabs = tabLList.map((item) => (
    <TabsTrigger
      onClick={() => onTabClick(item.name, item.url)}
      key={item.name}
      className={cn(tabStyle, style?.tabTrigger?.className)}
      value={item.name}
    >
      {t(item.name)}
    </TabsTrigger>
  ));
  const tabContents = tabLList.map((item, index: number) => (
    <TabsContent
      key={`${item.name}+${index}`}
      value={item.name}
      className={tabContentStyle}
      style={{
        scrollbarWidth: "none", // Firefox
        msOverflowStyle: "none", // IE 10+
      }}
    >
      {list && list.length === 0 ? (
        <div className="col-span-full text-sm text-muted-foreground py-6 text-center">
          No items to display.
        </div>
      ) : list &&
        (renderAll
          ? renderAll(list)
          : list.map((data: T, index: number) => (
              <div key={index}>{children(data)}</div>
            )))}
    </TabsContent>
  ));
  return (
    <div className={cn("grid gap-y-3 group", className)}>
      {/* Title */}
      <div className="relative w-full">
        <h1
          className="relative z-10 ltr:text-[28px] rtl:text-4xl-rtl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-400"
        >
          {title}
        </h1>
        {/* Decorative underline accent */}
        <div className="pointer-events-none absolute left-0 top-[90%] h-[3px] w-24 rounded-full bg-gradient-to-r from-violet-500 via-sky-400 to-emerald-400 opacity-90 group-hover:w-36 transition-all duration-500" />
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -inset-x-2 -top-8 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(30rem_10rem_at_10%_0%,theme(colors.violet.400/12),transparent_60%)]" />
      </div>

      {/* View all link */}
      <Link
        to={subTitleLink}
        className="justify-self-end ltr:text-[14px] rtl:text-xl-rtl inline-flex items-center gap-2 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/70 dark:hover:bg-slate-800 transition-colors shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/50"
        aria-label={subTitle}
      >
        <span className="font-semibold">{subTitle}</span>
        <ArrowRight className="size-[18px] rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </Link>

      <Tabs
        dir={i18n.dir()}
        value={tab}
        className={cn("col-span-full overflow-hidden", style?.tab?.className)}
      >
        <TabsList
          style={{
            scrollbarWidth: "none", // Firefox
            msOverflowStyle: "none", // IE 10+
          }}
          className={cn(
            "gap-x-1 overflow-x-auto select-none justify-start p-1 m-0 mb-3 bg-slate-100 dark:bg-slate-900/40 rounded-full ring-1 ring-slate-200/70 dark:ring-slate-800",
            style?.tabList?.className
          )}
        >
          {tabs}
        </TabsList>
        {!failed && list ? (
          tabContents
        ) : shimmer ? (
          <div
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
            className={tabContentStyle}
          >
            {shimmer}
          </div>
        ) : (
          <div className="col-span-full ltr:text-xl-ltr">
            <NastranSpinner />
          </div>
        )}
      </Tabs>
    </div>
  );
}
