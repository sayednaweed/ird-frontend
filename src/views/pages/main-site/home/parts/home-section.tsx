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
  icon?: React.ReactNode;
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
    icon,
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
  text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white
  transition-all duration-200
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-orange-400/50
  data-[state=active]:text-white data-[state=active]:shadow
  data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-700 data-[state=active]:to-orange-500
  after:content-[""] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:h-1 after:w-1 after:rounded-full after:bg-transparent
  data-[state=active]:after:bg-orange-500/90 dark:data-[state=active]:after:bg-orange-400/90
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
      {/* Title row */}
      <div className="relative w-full flex items-start gap-3 pb-4">
        {icon && (
          <div className="relative shrink-0 mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-700 to-orange-500 text-white shadow-md ring-1 ring-orange-500/40">
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(18rem_8rem_at_30%_-40%,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
            <span className="translate-y-[0.5px]">{icon}</span>
          </div>
        )}
        {/* Animated subtle grid background */}
        <div className="pointer-events-none absolute -inset-x-2 -top-6 h-16 opacity-60 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(100,116,139,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(100,116,139,0.06)_1px,transparent_1px)] bg-[size:14px_14px]" />
          <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-orange-400/10 to-transparent" />
        </div>
        <h1
          className="relative z-10 ltr:text-[28px] rtl:text-4xl-rtl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-orange-700 via-orange-600 to-orange-500 dark:from-orange-400 dark:via-orange-500 dark:to-orange-600"
        >
          {title}
        </h1>
        {/* Decorative underline accent */}
        <div className="pointer-events-none absolute left-0 bottom-0 h-[3px] w-24 rounded-full bg-gradient-to-r from-orange-700 via-orange-600 to-orange-400 opacity-90 group-hover:w-36 transition-all duration-500" />
        {/* Subtle glow */}
        <div className="pointer-events-none absolute -inset-x-2 -top-8 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(30rem_10rem_at_10%_0%,theme(colors.orange.400/12),transparent_60%)]" />
      </div>

      {/* View all link */}
      <Link
        to={subTitleLink}
        className="group/button justify-self-end ltr:text-[14px] rtl:text-xl-rtl inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-white bg-gradient-to-r from-orange-700 to-orange-500 hover:from-orange-600 hover:to-orange-400 transition-all duration-300 shadow-md shadow-orange-500/20 hover:shadow-lg hover:shadow-orange-500/30 ring-1 ring-orange-500/50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-400/80"
        aria-label={subTitle}
      >
        <span className="font-semibold tracking-tight">{subTitle}</span>
        <ArrowRight className="size-[18px] rtl:rotate-180 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        {/* Shine overlay */}
        <span className="pointer-events-none absolute -inset-px rounded-full opacity-0 group-hover/button:opacity-100 transition-opacity duration-300 bg-[radial-gradient(20rem_6rem_at_10%_-30%,rgba(255,255,255,0.25),transparent_60%)]" />
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
            "relative gap-x-1 overflow-x-auto select-none justify-start p-1 m-0 mt-1 mb-3 bg-slate-100 dark:bg-slate-900/40 rounded-full ring-1 ring-slate-200/70 dark:ring-slate-800",
            style?.tabList?.className
          )}
        >
          {/* Left fade shadow */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 bg-gradient-to-r from-white dark:from-slate-900 via-white/40 dark:via-slate-900/40 to-transparent rounded-l-full" />
          {tabs}
          {/* Right fade shadow */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-white dark:from-slate-900 via-white/40 dark:via-slate-900/40 to-transparent rounded-r-full" />
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
