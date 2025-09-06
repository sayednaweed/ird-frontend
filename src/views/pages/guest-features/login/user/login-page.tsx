import AnimatedPath from "@/components/custom-ui/animation/animated-path";
import AnimatedUserIcon from "@/components/custom-ui/icons/animated-user-icon";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="px-6 sm:px-16 pb-16 flex flex-col items-center h-screen pt-12">
      <div className="shadow-primary-box-shadow bg-tertiary w-fit rounded-full p-4">
        <AnimatedUserIcon />
      </div>
      <h1 className="drop-shadow-lg text-center relative text-tertiary uppercase text-[34px] mb-8 font-bold">
        {t("welcome")}
      </h1>
      <h1
        onClick={() => navigate("/auth/donor/login")}
        className="border py-4 px-5 rounded-md bg-primary/5 shadow hover:shadow-sm rtl:text-xl-rtl"
      >
        {t("are_a_donor")}
        <span className="text-fourth cursor-pointer hover:opacity-70 rtl:text-xl-rtl font-bold">
          {t("click_here")}
        </span>
        {t("to_login")}
      </h1>
      <h1
        onClick={() => navigate("/auth/organization/login")}
        className="border py-4 px-5 rounded-md bg-primary/5 mt-4 shadow hover:shadow-sm rtl:text-xl-rtl"
      >
        {t("are_a_organization")}{" "}
        <span className="text-fourth cursor-pointer hover:opacity-70 rtl:text-xl-rtl font-bold">
          {t("click_here")}
        </span>
        {t("to_login")}
      </h1>
      <svg width="45px" height="43px" viewBox="0 0 130 85">
        <AnimatedPath
          d="M10,50 l25,40 l85,-90"
          stroke="#fafafa"
          strokeWidth={20}
          duration={2000}
          fill="none"
        />
      </svg>
    </div>
  );
}
