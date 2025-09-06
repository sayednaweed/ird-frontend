import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import HeaderSection from "@/components/custom-ui/resuseable/header-section";
import AnimatedItem from "@/hook/animated-item";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import axiosClient from "@/lib/axois-client";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { TriangleAlert } from "lucide-react";

type FAQItem = {
  type_name: string;
  question: string;
  answer: string;
  order: number;
};

type FAQsByType = {
  [typeName: string]: FAQItem[];
};

export default function FaqsPage() {
  useScrollToSingleElement("main-header-id");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [faqs, setFaqs] = useState<FAQsByType | undefined>(undefined);
  const { t, i18n } = useTranslation();
  const initialize = async () => {
    try {
      if (loading) return;
      if (!loading) setLoading(true);

      const response = await axiosClient.get(`faqs-public`);
      if (response.status === 200) {
        setFaqs(response.data);
        if (failed) setFailed(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, [i18n.language]);

  const loader = (
    <div className=" space-y-6">
      <Shimmer className=" h-8 rounded-[2px]" />
      <Shimmer className=" h-8 rounded-[2px] w-full" />
    </div>
  );
  return (
    <>
      <HeaderSection
        description={t("faqs_title_des")}
        title={t("faqs_title")}
      />
      <div className="flex flex-col gap-y-16 py-18 px-2 xxl:px-8 sm:px-32">
        {loading ? (
          <>
            {loader}
            {loader}
          </>
        ) : failed ? (
          <div className="flex flex-col items-center gap-y-1 w-fit mx-auto my-12 p-4 rounded border-[2px] border-dashed">
            <TriangleAlert className="size-[44px] text-red-500" />
            <h1 className=" text-primary/40">{t("retry_desc")}</h1>
          </div>
        ) : (
          faqs &&
          Object.entries(faqs).map(([typeName, faqs]) => (
            <div key={typeName}>
              <AnimatedItem
                springProps={{
                  from: {
                    opacity: 0,
                  },
                  to: {
                    opacity: 1,
                  },
                  config: {
                    mass: 1,
                    tension: 180,
                    friction: 16,
                  },
                }}
                intersectionArgs={{
                  rootMargin: "-0% 0%",
                  once: true,
                }}
              >
                <h1 className="font-bold text-lg md:text-xl text-primary md:mb-4">
                  {typeName}
                </h1>
              </AnimatedItem>
              {faqs.map((faq, idx) => (
                <Accordion
                  key={idx}
                  type="single"
                  collapsible
                  className={
                    idx % 2 != 0 ? "border-t border-primary/5 my-1" : ""
                  }
                >
                  <AccordionItem value={faq.question}>
                    <AccordionTrigger className="font-semibold py-1">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="ltr:text-sm text-primary/80">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </div>
          ))
        )}
      </div>
    </>
  );
}
