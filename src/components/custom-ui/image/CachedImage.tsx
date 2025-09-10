import axiosClient from "@/lib/axois-client";
import { cn } from "@/lib/utils";
import { Image } from "lucide-react";
import React, { useState, useEffect } from "react";
import Shimmer from "../shimmer/shimmer";
import axios from "axios";
import { useDownloadStore } from "@/components/custom-ui/download-manager/download-store";

// Image data interface
export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  shimmerClassName?: string;
  ShimmerIconClassName?: string;
  src: string | undefined;
  routeIdentifier?: "public" | "profile" | "private";
}

// Custom image cache singleton
class ImageCache {
  private static instance: ImageCache;
  private cache: Record<string, string>;

  private constructor() {
    this.cache = {};
  }

  public static getInstance(): ImageCache {
    if (!ImageCache.instance) {
      ImageCache.instance = new ImageCache();
    }
    return ImageCache.instance;
  }

  public getImage(src: string): string | null {
    return this.cache[src] || null;
  }

  public cacheImage(src: string, img: string): void {
    this.cache[src] = img;
  }
}

// Image component with caching
const CachedImage = React.forwardRef<HTMLImageElement, ImageProps>(
  (
    {
      src,
      alt,
      className,
      shimmerClassName,
      ShimmerIconClassName,
      children,
      routeIdentifier,
      ...props
    },
    ref
  ) => {
    const [image, setImage] = useState<string | null>(null);
    const [failed, setFailed] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const start = useDownloadStore((s) => s.startDownload);
    const normalizePublicPath = (p: string): string => {
      try {
        if (!p) return p;
        // remove any leading slashes
        let q = p.replace(/^\/+/, "");
        // If path is like 'news<uuid>.jpg', fix to 'news/<uuid>.jpg'
        if (!q.includes("/") && q.startsWith("news") && !q.startsWith("news/")) {
          q = `news/${q.slice(4)}`;
        }
        return q;
      } catch {
        return p;
      }
    };
    const download = async () => {
      try {
        if (src == null || src == undefined) {
          if (image) setImage(null);
          setLoading(false);
          return;
        }
        if (typeof src == "object") {
          setImage(URL.createObjectURL(src));
          setLoading(false);
          return;
        }
        const cache = ImageCache.getInstance();

        // For public assets, avoid XHR/axios to bypass CORS and let the browser load the image directly
        if (routeIdentifier === "public" && typeof src === "string") {
          const base = (import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "");
          if (base) {
            const directUrl = `${base}/${normalizePublicPath(src)}`;
            setImage(directUrl);
            cache.cacheImage(src, directUrl);
            setLoading(false);
            return;
          }
        }

        // Check if image is already cached
        const cachedImage = cache.getImage(src);
        if (cachedImage) {
          setImage(cachedImage);
        } else {
          // No direct public XHR fallback to avoid CORS; we rely on the early direct URL path for public
          const tryDirectPublic = async () => false;

          // Image not cached, fetch and cache via API media route or direct fallback
          try {
            const response = routeIdentifier
              ? await axiosClient.get(`media/${routeIdentifier}`, {
                  params: {
                    path:
                      routeIdentifier === "public" && typeof src === "string"
                        ? normalizePublicPath(src)
                        : src,
                  },
                  responseType: "blob", // Important
                  // For public media, do not send cookies to avoid strict CORS
                  withCredentials: routeIdentifier === "public" ? false : axiosClient.defaults.withCredentials,
                })
              : await axios.get(src, {
                  responseType: "blob",
                });

            if (response.status == 200) {
              const contentType = (response as any).headers?.["content-type"] || response.data?.type;
              // If backend returned JSON (e.g., 404 wrapper), fallback to direct for public
              if (
                (typeof contentType === "string" && contentType.includes("application/json")) ||
                response.data?.type === "application/json"
              ) {
                const ok = await tryDirectPublic();
                if (!ok) {
                  setFailed(true);
                }
              } else {
                // Create a temporary URL for the downloaded image
                const imageUrl = URL.createObjectURL(new Blob([response.data]));
                setImage(imageUrl);
                cache.cacheImage(src, imageUrl);
              }
            }
          } catch (err: any) {
            // If media route fails (e.g., 404), try direct for public assets
            if (routeIdentifier === "public") {
              // Already attempted direct URL path above; mark as failed
              setFailed(true);
            } else {
              setFailed(true);
            }
          }
        }
      } catch (error: any) {
        console.log(error);
        setFailed(true);
      }
      setLoading(false);
    };
    useEffect(() => {
      download();
    }, [src]);

    if (loading) {
      return (
        <Shimmer
          className={cn(
            "size-9 bg-primary/15 w-full rounded-sm flex justify-center items-center",
            shimmerClassName
          )}
        >
          <svg
            onClick={download}
            className={cn("size-9 fill-primary/30", ShimmerIconClassName)}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 18"
          >
            <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
          </svg>
        </Shimmer>
      );
    } else if (failed || !image) {
      return (
        <div
          className={cn(
            "size-9 w-full rounded-sm flex justify-center items-center",
            shimmerClassName
          )}
        >
          <Image
            className={cn(
              "size-1/2 text-primary opacity-60",
              ShimmerIconClassName
            )}
          />
        </div>
      );
    }
    return (
      <img
        onClick={() =>
          start({
            id: crypto.randomUUID(),
            filename: src
              ? src.substring(src.lastIndexOf("/") + 1)
              : "profile.jpeg",
            url:
              routeIdentifier === "public" && typeof src === "string"
                ? `${(import.meta as any).env?.VITE_API_BASE_URL?.replace(/\/+$/, "")}/${normalizePublicPath(src)}`
                : `media/${routeIdentifier ?? "profile"}?path=${src}`,
          })
        }
        ref={ref}
        className={cn("cursor-pointer", className)}
        {...props}
        src={image}
        alt={alt}
      />
    );
  }
);

export default CachedImage;
