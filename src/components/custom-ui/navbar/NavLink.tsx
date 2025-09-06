import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  title: string;
  activeLink: string;
  time: number;
  to: string;
}
const NavLink = (props: NavLinkProps) => {
  const navigate = useNavigate();
  const { title, activeLink, to } = props;
  const { t } = useTranslation();
  const style =
    activeLink == title
      ? "md:before:w-full text-white md:text-fourth bg-fourth"
      : `md:group-hover:before:w-full md:group-hover:text-fourth hover:bg-primary/5`;
  const onNavigate = () => {
    navigate(to);
  };

  return (
    <div className="relative cursor-pointer group w-fit" onClick={onNavigate}>
      <h1
        className={cn(
          `md:transition-colors 
            duration-300 
            ease-in-out 
            px-3 
            md:relative 
            md:cursor-pointer 
            md:before:content-[''] 
            md:before:absolute 
            md:before:-bottom-3 
            md:before:left-1/2 
            md:before:translate-x-[-50%] 
            md:before:w-0 
            md:before:h-[2px] 
            md:before:bg-fourth 
            md:before:transition-[width] 
            md:before:duration-300 
            md:before:ease-in-out

            border md:border-none
            rounded-full
            py-2 md:py-0            
            md:hover:bg-transparent md:bg-transparent
            ltr:text-sm rtl:sm:text-lg-rtl rtl:text-[14px] rtl:font-semibold`,
          style
        )}
      >
        {t(title)}
      </h1>
    </div>
  );
};

export default NavLink;
