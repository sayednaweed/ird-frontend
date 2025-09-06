import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import { cn } from "@/lib/utils";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export interface InfiniteScrollProps<T> {
  scrollThreshold?: number; // How far (in px) before the bottom to trigger loading more
  pageSize?: number; // Number of items per page fetch
  scrollableId?: string; // The id of the scrollable container element, e.g. "main_layout"
  renderItem: (item: T, index: number) => React.ReactNode; // How to render each item
  fetchData: (page: number, pageSize: number) => Promise<T[]>; // Function to fetch data
  shimmer?: React.ReactNode;
  style?: {
    parentContainerClassName?: string;
    containerClassName?: string;
  };
}

const InfiniteScroll = <T,>(props: InfiniteScrollProps<T>) => {
  const {
    scrollThreshold = 100,
    pageSize = 10,
    renderItem,
    fetchData,
    scrollableId,
    shimmer,
    style,
  } = props;

  // State to hold loaded items
  const [items, setItems] = useState<T[]>([]);
  // Translation function (for messages like "loading", "no items")
  const { t } = useTranslation();
  const { containerClassName, parentContainerClassName } = style ?? {};
  // Ref to avoid multiple fetches at the same time
  const isFetchingRef = useRef(false);
  // State to know if more data is available
  const [hasMore, setHasMore] = useState(true);
  const [loadingInfo, setLoadingInfo] = useState({
    fetching: false,
    showShimmer: true,
  });
  // Track current page number
  const [page, setPage] = useState(1);

  // Ref to the sentinel div that IntersectionObserver watches
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Function to fetch data for a given page
  const fetchPosts = useCallback(
    async (pageNumber: number) => {
      try {
        setLoadingInfo({
          fetching: true,
          showShimmer: false,
        });

        const data = await fetchData(pageNumber, pageSize);
        setItems((prev) => [...prev, ...data]);

        // If returned data length < pageSize, no more pages available
        if (data.length < pageSize) {
          setHasMore(false);
        }
      } catch (e) {
        console.error("Error fetching posts", e);
      } finally {
        isFetchingRef.current = false; // Unlock fetching
        setPage(pageNumber); // Set page to the page we just fetched
        setLoadingInfo({
          fetching: false,
          showShimmer: false,
        });
      }
    },
    [fetchData, pageSize]
  );

  // Initial load: fetch first page when component mounts
  useEffect(() => {
    isFetchingRef.current = true; // Lock fetching before first fetch
    fetchPosts(1);
  }, [fetchPosts]);

  // Setup IntersectionObserver to watch the sentinel element inside scrollable container
  useEffect(() => {
    // Find the scrollable container by ID, or use viewport (null) if no ID given
    const rootElement = scrollableId
      ? document.getElementById(scrollableId)
      : null;

    if (!sentinelRef.current) return;

    // Create IntersectionObserver with options:
    // root: the scrollable container (or null for viewport)
    // rootMargin: bottom margin to trigger earlier (scrollThreshold px before bottom)
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If sentinel is visible, we have more data, and not already fetching
        if (entry.isIntersecting && hasMore && !isFetchingRef.current) {
          isFetchingRef.current = true;
          fetchPosts(page + 1); // Fetch next page after the current page
        }
      },
      {
        root: rootElement,
        rootMargin: `0px 0px ${scrollThreshold}px 0px`,
      }
    );

    // Start observing sentinel element
    observer.observe(sentinelRef.current);

    // Cleanup on unmount or dependencies change
    return () => {
      observer.disconnect();
    };
  }, [fetchPosts, hasMore, page, scrollThreshold, scrollableId]);

  return (
    <div
      className={cn("h-full w-full overflow-auto", parentContainerClassName)}
    >
      <div className={cn("grid gap-4 place-items-center", containerClassName)}>
        {loadingInfo.showShimmer ? (
          <>{shimmer ? <>{shimmer}</> : <NastranSpinner />}</>
        ) : items.length === 0 ? (
          <h1 className="text-center py-4">{t("no_item")}</h1>
        ) : (
          <>{items.map((item, index) => renderItem(item, index))}</>
        )}
      </div>

      {loadingInfo.fetching && <NastranSpinner className="mt-auto" />}

      {/* End of list message */}
      {!hasMore && page > 2 && (
        <p className="text-center py-12 rtl:text-sm-rtl ltr:text-md-ltr text-primary/70 font-semibold">
          {t("you_reached_end")}
        </p>
      )}

      {/* Sentinel div observed by IntersectionObserver */}
      <div ref={sentinelRef} style={{ height: 1 }} />
    </div>
  );
};

export default InfiniteScroll;
