import AnimatedNumber from "@/components/custom-ui/resuseable/animated-number";
import Card from "@/components/custom-ui/resuseable/card";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { cn } from "@/lib/utils";

export interface DashboardCardProps {
  title: string;
  description: string;
  className?: string;
  value: number;
  symbol?: string;
  icon: any;
  loading: boolean;
}

export default function DashboardCard(props: DashboardCardProps) {
  const { value, title, symbol, icon, className, description, loading } = props;
  return (
    <Card
      className={cn(
        "flex justify-between items-center",
        loading && "!p-0",
        className
      )}
    >
      {loading ? (
        <Shimmer className="h-[140px] w-full" />
      ) : (
        <>
          <div>
            <h1 className="font-semibold">{title}</h1>
            <AnimatedNumber
              className="font-bold px-2 text-orange-500"
              min={0}
              symbol={symbol}
              max={value}
            />
            <h1 className="text-[13px] text-primary/85 pt-8">{description}</h1>
          </div>
          {icon}
        </>
      )}
    </Card>
  );
}
