import CachedImage from "@/components/custom-ui/image/CachedImage";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import axiosClient from "@/lib/axois-client";
import HomeHeader from "@/views/pages/main-site/home/parts/home-header";
import HomeSection from "@/views/pages/main-site/home/parts/home-section";
import { ChevronsRight } from "lucide-react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

interface Book {
  id: string;
  title: string;
  description: string;
  image: string;
}
export default function HomePage() {
  useScrollToSingleElement("main-header-id");
  const { t } = useTranslation();
  const fetch = useCallback(async (url: string) => {
    try {
      const response = await axiosClient.get(url);
      if (response.status === 200) {
        return { failed: false, data: response.data };
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
    return { failed: true, data: [] };
  }, []);
  const loader = (
    <Card className="m-0 p-0 rounded-md shadow max-h-[600px] gap-y-3 hover:-translate-y-1 transition-transform min-w-[300px] md:w-[320px] hover:shadow-lg duration-300 ease-out">
      <Shimmer className="p-0 h-[300px] sm:h-[300px] w-full" />
      <Shimmer className="h-10 w-52 mx-auto" />
      <Shimmer className="h-16 w-52 mx-auto" />
      <Shimmer className="h-9 w-10 ltr:ml-2 rtl:mr-2 mb-2" />
    </Card>
  );
  return (
    <>
      <HomeHeader />
      <section>
        <HomeSection<Book>
          title={t("health_books")}
          subTitle={t("view_all")}
          subTitleLink={""}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "flex gap-x-12 overflow-x-auto gap-y-16 py-4",
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
              name: "books",
              url: "health-books",
            },
            {
              name: "audio_books",
              url: "health-books",
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
              className="m-0 p-0 rounded-md shadow relative min-h-[500px] max-h-[500px] gap-y-3 hover:-translate-y-1 transition-transform min-w-[300px] md:w-[320px] duration-300 ease-out"
            >
              <CardContent className="p-0 h-[300px] sm:h-[300px]">
                <CachedImage
                  src={data.image}
                  shimmerClassName="min-w-full h-full object-fill rounded-t-md"
                  className="min-w-full shadow-lg h-full object-fill rounded-t-md"
                />
              </CardContent>
              <CardFooter className="flex flex-col justify-start items-start gap-y-2 pb-6">
                <h2 className="font-bold rtl:text-lg-rtl max-w-full ltr:text-2xl-ltr line-clamp-2">
                  {data.title}
                </h2>
                <h1 className="rtl:text-lg-rtl ltr:text-xl-ltr max-w-full text-primary/95 line-clamp-3 px-2">
                  {data.description}
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
        <HomeSection<Book>
          title={t("sports_books")}
          subTitle={t("view_all")}
          subTitleLink={""}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "flex gap-x-12 overflow-x-auto gap-y-16 py-4",
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
              name: "books",
              url: "sports-books",
            },
            {
              name: "audio_books",
              url: "sports-books",
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
              className="m-0 p-0 rounded-md shadow relative min-h-[500px] max-h-[500px] gap-y-3 hover:-translate-y-1 transition-transform min-w-[300px] md:w-[320px] duration-300 ease-out"
            >
              <CardContent className="p-0 h-[300px] sm:h-[300px]">
                <CachedImage
                  src={data.image}
                  shimmerClassName="min-w-full h-full object-fill rounded-t-md"
                  className="min-w-full shadow-lg h-full object-fill rounded-t-md"
                />
              </CardContent>
              <CardFooter className="flex flex-col justify-start items-start gap-y-2 pb-6">
                <h2 className="font-bold rtl:text-lg-rtl max-w-full ltr:text-2xl-ltr line-clamp-2">
                  {data.title}
                </h2>
                <h1 className="rtl:text-lg-rtl ltr:text-xl-ltr max-w-full text-primary/95 line-clamp-3 px-2">
                  {data.description}
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
        <HomeSection<Book>
          title={t("foods_book")}
          subTitle={t("view_all")}
          subTitleLink={""}
          className="pb-12 pt-8 px-2 sm:px-12 xl:px-32"
          style={{
            tabContent: {
              className: "flex gap-x-12 overflow-x-auto gap-y-16 py-4",
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
              name: "books",
              url: "foods-books",
            },
            {
              name: "audio_books",
              url: "foods-books",
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
              className="m-0 p-0 rounded-md shadow relative min-h-[500px] max-h-[500px] gap-y-3 hover:-translate-y-1 transition-transform min-w-[300px] md:w-[320px] duration-300 ease-out"
            >
              <CardContent className="p-0 h-[300px] sm:h-[300px]">
                <CachedImage
                  src={data.image}
                  shimmerClassName="min-w-full h-full object-fill rounded-t-md"
                  className="min-w-full shadow-lg h-full object-fill rounded-t-md"
                />
              </CardContent>
              <CardFooter className="flex flex-col justify-start items-start gap-y-2 pb-6">
                <h2 className="font-bold rtl:text-lg-rtl max-w-full ltr:text-2xl-ltr line-clamp-2">
                  {data.title}
                </h2>
                <h1 className="rtl:text-lg-rtl ltr:text-xl-ltr max-w-full text-primary/95 line-clamp-3 px-2">
                  {data.description}
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
    </>
  );
}
