import {
  useInView,
  animated,
  type IntersectionArgs,
  SpringValue,
  type AnimationResult,
  Controller,
} from "@react-spring/web";
import { useCallback, useState } from "react";

export interface AnimatedItemProps {
  springProps: {
    from?: object;
    to?: object | object[];
    delay?: number;
    immediate?: boolean;
    reset?: boolean;
    reverse?: boolean;
    pause?: boolean;
    onStart?: (
      result: AnimationResult,
      spring: Controller | SpringValue,
      item?: any
    ) => void;
    config?: {
      mass: number;
      friction: number;
      tension: number;
    };
  };
  intersectionArgs: IntersectionArgs;
  children: React.ReactNode | ((inView: boolean) => React.ReactNode);
}

export default function AnimatedItem(props: AnimatedItemProps) {
  const [inView, setInView] = useState(false);
  const { springProps, intersectionArgs, children } = props;
  const defaultOnStart = useCallback(
    () => {
      setInView(true);
    },
    [] // no dependencies, memoized once
  );
  const composedOnStart = springProps.onStart ?? defaultOnStart;

  const springConfig = { ...springProps, onStart: composedOnStart };
  const [ref, springs] = useInView(() => springConfig, intersectionArgs);

  return (
    <animated.div ref={ref} style={springs}>
      {typeof children === "function" ? children(inView) : children}
    </animated.div>
  );
}
