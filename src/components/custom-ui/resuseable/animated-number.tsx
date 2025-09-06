import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export interface AnimatedNumberProps
  extends React.HTMLAttributes<HTMLDivElement> {
  min: number;
  max: number | null; // Allow max to be null initially
  symbol?: string;
}

const AnimatedNumber = (props: AnimatedNumberProps) => {
  const { min, max, symbol, className } = props;
  const [number, setNumber] = useState(min); // Initialize with min value

  useEffect(() => {
    // Ensure the animation only runs when `max` is valid and different from `min`
    if (max !== null && max !== min) {
      const animationDuration = 3000; // Total animation time in ms
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (startTime === null) startTime = timestamp;

        const elapsedTime = timestamp - startTime;
        const progress = Math.min(elapsedTime / animationDuration, 1); // Normalize to 1

        const nextValue = min + (max - min) * progress;
        setNumber(Math.round(nextValue));

        if (progress < 1) {
          requestAnimationFrame(animate); // Continue animating
        }
      };

      requestAnimationFrame(animate);
    }
  }, [min, max]); // Only depend on `min` and `max`, not `isAnimating`

  return (
    <div className={cn("font-bold", className)}>
      {number}
      {symbol && <span className="relative font-bold">{symbol}</span>}
    </div>
  );
};

export default AnimatedNumber;
