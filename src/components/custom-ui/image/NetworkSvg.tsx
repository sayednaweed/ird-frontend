import { refreshAccessToken } from "@/lib/axois-client";
import { cn } from "@/lib/utils";
import React from "react";
export interface NetworkSvgProps
  extends React.HtmlHTMLAttributes<HTMLDivElement> {
  src: string;
  routeIdentifier: "public";
}

const cacheName = import.meta.env.VITE_API_BASE_URL;

const NetworkSvg = React.forwardRef<HTMLDivElement, NetworkSvgProps>(
  ({ src, className, routeIdentifier }, ref) => {
    const [svgContent, setSvgContent] = React.useState<string | undefined>(
      undefined
    );
    const iconStyle =
      "opacity-90 min-h-[18px] min-w-[20px] w-[20px] h-[18px] ltr:ml-2 rtl:mr-2";

    React.useEffect(() => {
      const encodedPath = encodeURIComponent(src);
      const fullUrl = `${cacheName}/api/v1/media/${routeIdentifier}?path=${encodedPath}`;

      const fetchAndCacheSvg = async () => {
        try {
          let response = await fetch(fullUrl);
          if (response.status === 403) {
            await refreshAccessToken();
            response = await fetch(fullUrl);
          }
          if (response.ok) {
            const responseClone = response.clone(); // clone BEFORE consuming body
            const svgText = await response.text();
            setSvgContent(svgText);

            if ("caches" in window) {
              const cache = await caches.open(cacheName);
              await cache.put(fullUrl, responseClone);
            }
          } else {
            console.error("Failed to fetch SVG", response.statusText);
          }
        } catch (error) {
          console.error("Error fetching SVG:", error);
        }
      };

      const checkCache = async () => {
        console.log();
        if (!("caches" in window)) {
          fetchAndCacheSvg();
          return;
        }

        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(fullUrl);

        if (cachedResponse) {
          const svgText = await cachedResponse.text();
          setSvgContent(svgText);
        } else {
          fetchAndCacheSvg();
        }
      };

      checkCache();
    }, [src, routeIdentifier]);

    return svgContent === undefined ? (
      <div className={`${iconStyle} bg-primary rounded-full animate-pulse`} />
    ) : (
      <div
        ref={ref}
        className={cn(
          `[&>svg>path]:fill-tertiary [&>svg>g>*]:fill-tertiary ${iconStyle}`,
          className
        )}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    );
  }
);

export default NetworkSvg;
