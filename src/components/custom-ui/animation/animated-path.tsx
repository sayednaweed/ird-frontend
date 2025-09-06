import React, { useEffect, useRef } from "react";

interface AnimatedStrokeProps extends React.SVGProps<SVGPathElement> {
  duration?: number;
  delay?: number;
}

const AnimatedStrokePath: React.FC<AnimatedStrokeProps> = ({
  duration = 2000,
  delay = 0,
  ...props
}) => {
  const pathRef = useRef<SVGPathElement | null>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const length = path.getTotalLength();
    path.style.strokeDasharray = length.toString();
    path.style.strokeDashoffset = length.toString();

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime - delay;
      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }
      const progress = Math.min(elapsed / duration, 1);
      path.style.strokeDashoffset = (length * (1 - progress)).toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [duration, delay]);

  return <path ref={pathRef} {...props} />;
};

export default AnimatedStrokePath;
