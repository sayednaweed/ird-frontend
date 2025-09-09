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
  px-4
  data-[state=active]:border-b-fourth
  ltr:text-2xl-ltr font-medium rtl:text-xl-rtl
  data-[state=active]:shadow-none
  transition-colors
  data-[state=active]:text-fourth
  overflow-hidden whitespace-nowrap
  text-primary
  data-[state=active]:bg-transparent
  border-b-[2px]
  h-full
  rounded-none
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
    <div className={cn("grid gap-y-2", className)}>
      <h1 className=" ltr:text-2xl rtl:text-4xl-rtl font-semibold text-primary">
        {title}
      </h1>
      <Link
        to={subTitleLink}
        className="justify-self-end ltr:text-xl-ltr rtl:text-xl-rtl flex items-center text-fourth gap-x-2 hover:bg-fourth/5 py-1 px-2 rounded-sm transition-all ease-in-out duration-300"
      >
        {subTitle}
        <ArrowRight className="size-[20px] rtl:rotate-180" />
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
            "border-t gap-x-1 border-primary-foreground/15 overflow-x-auto select-none justify-start p-0 m-0 mb-2 bg-transparent rounded-none",
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
