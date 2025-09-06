import { cn } from "@/lib/utils";
import React from "react";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  (props, ref) => {
    const { className, children, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "rounded-sm px-5 h-fit items-center border bg-card w-[90%] md:w-fit overflow-x-auto flex gap-x-4",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

interface BreadcrumbSeparatorProps extends React.SVGProps<SVGSVGElement> {}

const BreadcrumbSeparator = React.forwardRef<
  SVGSVGElement,
  BreadcrumbSeparatorProps
>((props, ref) => {
  const { className, children, ...rest } = props;

  return (
    <svg
      ref={ref}
      {...rest}
      fill="currentColor"
      viewBox="0 0 24 44"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn(
        "text-primary/15 min-h-[40px] min-w-[20px] h-[40px] w-[20px] rtl:rotate-180",
        className
      )}
    >
      <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z"></path>
    </svg>
  );
});

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLDivElement> {}

const BreadcrumbItem = React.forwardRef<HTMLDivElement, BreadcrumbItemProps>(
  (props, ref) => {
    const { className, children, ...rest } = props;

    return (
      <div
        ref={ref}
        {...rest}
        className={cn(
          "text-primary/70 rtl:pt-[2px] hover:text-primary capitalize cursor-pointer transition-colors duration-200 font-medium rtl:text-xl-rtl ltr:text-[14px]",
          className
        )}
      >
        {children}
      </div>
    );
  }
);

interface BreadcrumbHomeProps extends React.SVGProps<SVGSVGElement> {}

const BreadcrumbHome = React.forwardRef<SVGSVGElement, BreadcrumbHomeProps>(
  (props, ref) => {
    const { className, children, ...rest } = props;

    return (
      <svg
        ref={ref}
        {...rest}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        // aria-hidden="true"
        // data-slot="icon"
        className={cn(
          "text-primary/60 fill-primary/60 hover:scale-105 min-w-[18px] min-h-[18px] size-[18px] hover:fill-primary/90 transition-[fill] duration-300 cursor-pointer",
          className
        )}
      >
        <path
          fillRule="evenodd"
          d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z"
          clipRule="evenodd"
        ></path>
      </svg>
    );
  }
);

export { Breadcrumb, BreadcrumbSeparator, BreadcrumbItem, BreadcrumbHome };
