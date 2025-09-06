import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useState } from "react";
import axiosClient from "@/lib/axois-client";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { HomeHeaderTab } from "@/views/pages/main-site/home/parts/home-header-tab";

export default function HomeHeader() {
  const [data, setData] = useState<{
    items: { title: string; image: string; description: string }[];
    tab: string;
  }>({ items: [], tab: "" });
  const { t, i18n } = useTranslation();
  const initialize = async () => {
    try {
      const response = await axiosClient.get(`slideshows/public`);
      if (response.status === 200) {
        setData({
          tab: response.data.length != 0 ? response.data[0].title : "",
          items: response.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
  };

  useEffect(() => {
    initialize();
  }, [i18n.language]);
  const tabStyle =
    "data-[state=active]:border-b-fourth ltr:text-sm rtl:sm:text-lg-rtl rtl:text-[14px] rtl:font-semibold overflow-hidden whitespace-nowrap text-primary-foreground data-[state=active]:bg-transparent border-b-[2px] h-full rounded-none";

  const tabList = useMemo(
    () =>
      data?.items.map((item) => (
        <TabsTrigger key={item.title} className={tabStyle} value={item.title}>
          <h1 className="truncate">{item.title}</h1>
        </TabsTrigger>
      )),
    [data.items]
  );
  const tabContents = useMemo(
    () =>
      data?.items.map((item, index: number) => (
        <TabsContent value={item.title} key={`${item.title}-${index}`}>
          <HomeHeaderTab
            title={item.title}
            image={item.image}
            description={item.description}
          />
        </TabsContent>
      )),
    [data?.items]
  );
  useEffect(() => {
    if (!data.items.length || data.items.length == 0) return;

    const interval = setInterval(() => {
      setData((prevData) => {
        const currentIndex = prevData.items.findIndex(
          (item) => item.title === prevData.tab
        );
        const nextIndex = (currentIndex + 1) % prevData.items.length;
        return { ...prevData, tab: prevData.items[nextIndex].title };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [data.items]);

  const onChange = (value: string) => setData({ ...data, tab: value });

  const loader = (
    <div className="flex flex-col px gap-y-4 items-center lg:items-start mb-12 lg:mb-0 z-10 lg:w-[60%] h-full pt-12 pb-12 lg:pb-16 px-8 md:px-12 w-full rtl:xl:pr-20">
      <Shimmer className=" h-12 mt-8 w-1/3 border border-primary-foreground/5 rounded-[2px]" />
      <Shimmer className=" h-44 w-full border border-primary-foreground/5 rounded-[2px]" />
      <Shimmer className=" h-12 mt-8 w-1/3 border border-primary-foreground/5 rounded-full" />
      <Shimmer className=" h-12 mt-8 w-full border border-primary-foreground/5 rounded-[2px]" />
      <Shimmer
        className="-order-1 mb-2 lg:mb-20 w-[80%] xxl:w-[40%] sm:w-[350px] sm:h-[450px] xl:h-[500px] xl:w-[400px] lg:[transform:perspective(1000px)_rotateY(-12deg)] lg:absolute lg:translate-x-0 lg:top-1/2 lg:-translate-y-1/2 rtl:left-0 rtl:lg:left-[5%] rtl:xl:left-[10%] ltr:lg:right-[5%] ltr:xl:right-[10%] z-10
           bg-white/10 backdrop-blur-md backdrop-saturate-150 rounded-xl"
      />
    </div>
  );
  return (
    <div
      className="px-8 md:px-12 pt-12 w-full rtl:xl:pr-20 bg-gradient-to-r relative from-gradient-dark-from overflow-hidden to-gradient-dark-to from-0% to-100% dark:border-primary/5 h-fit lg:h-[600px]
          after:content-[''] after:top-0 after:bg-gradient-to-r after:from-fourth/70 after:to-fourth/90 after:h-full after:w-[90%] after:absolute after:-skew-x-12 rtl:after:left-[-60%] ltr:after:right-[-60%]"
    >
      {data.items.length == 0 ? (
        loader
      ) : (
        <Tabs
          dir={i18n.dir()}
          onValueChange={onChange}
          value={data.tab}
          className="lg:w-[60%] flex flex-col-reverse h-full w-full"
        >
          <TabsList
            style={{
              scrollbarWidth: "none", // Firefox
              msOverflowStyle: "none", // IE 10+
            }}
            className="border-t gap-x-1 border-primary-foreground/15 overflow-x-auto select-none bg-transparent w-full justify-start p-0 m-0 mb-2 rounded-none"
          >
            {tabList}
          </TabsList>
          {tabContents}
        </Tabs>
      )}
    </div>
  );
}
