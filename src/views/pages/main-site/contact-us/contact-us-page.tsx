import { useTranslation } from "react-i18next";
import { Clock, Mail, MapPin, SendHorizonal } from "lucide-react";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import HeaderSection from "@/components/custom-ui/resuseable/header-section";
import AnimatedItem from "@/hook/animated-item";
import { toast } from "sonner";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import CustomTextarea from "@/components/custom-ui/textarea/CustomTextarea";
import { validate } from "@/validation/validation";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import axiosClient from "@/lib/axois-client";
import { useScrollToSingleElement } from "@/hook/use-scroll-to-single-element";
import Staffs from "@/views/pages/main-site/contact-us/parts/staffs";

export default function ContactUsPage() {
  useScrollToSingleElement("main-header-id");
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<any>([]);
  const [error, setError] = useState<Map<string, string>>(new Map());
  const [footer, setFooter] = useState<any | undefined>(undefined);
  const { t, i18n } = useTranslation();
  const initialize = async () => {
    try {
      const response = await axiosClient.get(`about/office`);
      if (response.status === 200) {
        setFooter(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("something_went_wrong"));
    }
  };

  useEffect(() => {
    initialize();
  }, [i18n.language]);
  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };
  const onFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!loading) setLoading(true);
    const passed = await validate(
      [
        {
          name: "name",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "email",
          rules: ["required"],
        },
        {
          name: "contact",
          rules: ["required", "max:10", "min:10"],
        },
        {
          name: "subject",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "your_message",
          rules: ["required", "max:45", "min:3"],
        },
      ],
      userData,
      setError
    );
    if (!passed) {
      setLoading(false);
      return;
    }

    toast.success(t("success"));
    setLoading(false);
  };

  return (
    <>
      <HeaderSection
        description={t("get_in_touch_des")}
        title={t("get_in_touch")}
      />

      <div className=" flex flex-col lg:grid lg:grid-cols-2 gap-y-20 gap-x-12 pt-18 pb-24 px-2 xxl:px-8 sm:px-32">
        <div className="flex flex-col justify-self-center">
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
              {t("contact_information")}
            </h1>
          </AnimatedItem>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-4">
            <MapPin className="size-[20px] text-fourth" />
            {footer ? (
              <a
                href="https://www.google.com/maps/search/?api=1&query=Sehat-e-Ama+Square,+Wazir+Akbar+Khan+Road,+Kabul,+Afghanistan"
                target="_blank"
                rel="noopener noreferrer"
                className="ltr:text-md rtl:text-xl-rtl font-normal tracking-wider w-fit text-primary/80"
              >
                {t("moph_address")}
              </a>
            ) : (
              <Shimmer className="h-6 rounded-[2px]" />
            )}

            {/* Email */}
            <Mail className="size-[20px] text-fourth" />
            {footer ? (
              <a
                href={`mailto:${footer?.email}`}
                className="ltr:text-md rtl:text-sm-rtl break-all font-normal tracking-wider w-fit text-wrap text-primary/80"
              >
                {footer?.email}
              </a>
            ) : (
              <Shimmer className="h-6 rounded-[2px]" />
            )}
            <Clock className="size-[20px] text-fourth" />
            <div>
              <h1 className="ltr:text-md rtl:text-md-rtl break-all pb-1 tracking-wider w-fit text-wrap text-primary/90 font-semibold">
                {t("response_time")}
              </h1>
              <h1 className="ltr:text-sm rtl:font-bold rtl:text-sm-rtl break-all font-light tracking-wider w-fit text-wrap text-primary/80">
                {t("response_time_des")}
              </h1>
            </div>
            <Staffs className="col-span-full mt-0" url="about/staffs" />
            <iframe
              src="https://www.google.com/maps?q=Sehat-e-Ama+Square,+Wazir+Akbar+Khan+Road,+Kabul,+Afghanistan&output=embed"
              className="border-0 rounded-md col-span-full w-full h-60"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
        <div className="flex flex-col">
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
              {t("send_us_message")}
            </h1>
          </AnimatedItem>
          <CustomInput
            size_="sm"
            placeholder={t("enter_your_name")}
            type="text"
            onChange={handleChange}
            name="name"
            errorMessage={error.get("name")}
          />

          <CustomInput
            size_="sm"
            placeholder={t("enter_your_email")}
            type="email"
            name="email"
            onChange={handleChange}
            errorMessage={error.get("email")}
          />

          <CustomInput
            size_="sm"
            placeholder={t("enter_ur_pho_num")}
            type="number"
            name="contact"
            onChange={handleChange}
            errorMessage={error.get("contact")}
          />

          <CustomInput
            size_="sm"
            placeholder={t("subject")}
            type="text"
            onChange={handleChange}
            name="subject"
            errorMessage={error.get("subject")}
          />

          <CustomTextarea
            name="your_message"
            rows={4}
            onChange={handleChange}
            errorMessage={error.get("your_message")}
            placeholder={t("your_message")}
          />

          <PrimaryButton
            onClick={onFormSubmit}
            disabled={loading}
            className={`mt-8 items-center rounded gap-x-4 self-center`}
          >
            <ButtonSpinner loading={loading}>{t("send_msg")}</ButtonSpinner>
            <SendHorizonal className="size-[18px] rtl:rotate-180" />
          </PrimaryButton>
        </div>
      </div>
    </>
  );
}
