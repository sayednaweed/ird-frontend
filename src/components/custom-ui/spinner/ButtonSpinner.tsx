import { cn } from "@/lib/utils";

export interface IButtonSpinnerProps {
  children: any;
  loading: boolean;
  className?: string;
}

export default function ButtonSpinner(props: IButtonSpinnerProps) {
  const { loading, children, className } = props;
  return (
    <>
      {loading && (
        <div className="relative w-[16px] h-[16px]">
          {/* <!-- Ring --> */}
          <div
            className="w-[16px] h-[16px] rounded-full animate-spin absolute
              border border-solid border-secondary border-t-transparent"
          />
        </div>
      )}
      <h1 className={cn("flex items-center", className)}>{children}</h1>
    </>
  );
}
