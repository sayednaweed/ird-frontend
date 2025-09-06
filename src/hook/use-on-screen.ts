import { useEffect, useState } from "react";

export const useOnScreen = (
  ref: React.RefObject<HTMLElement | null>,
  threshold = 0.2
) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const current = ref.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIntersecting(true);
          observer.disconnect(); // only once
        }
      },
      { threshold }
    );

    observer.observe(current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return isIntersecting;
};
