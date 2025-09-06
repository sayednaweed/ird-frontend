import { useEffect, useRef, type RefObject } from "react";
import type { Notification } from "@/database/models";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/components/custom-ui/navbar/notifications";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface InfiniteScrollOnGivenDivProps {
  fetchPosts: (pageNumber: number) => void;
  SCROLL_THRESHOLD: number;
  isFetchingRef: RefObject<boolean>;
  hasMore: boolean;
  notifications: {
    items: Notification[] | undefined;
    submitted: boolean;
    unreadCount: number;
  };
  page: number;
}
const InfiniteScrollOnGivenDiv = (props: InfiniteScrollOnGivenDivProps) => {
  const {
    fetchPosts,
    SCROLL_THRESHOLD,
    isFetchingRef,
    hasMore,
    notifications,
    page,
  } = props;
  const { t } = useTranslation();
  const scrollDivRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const scrollDiv = scrollDivRef.current;
    if (!scrollDiv) return;

    const onScroll = () => {
      if (isFetchingRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = scrollDiv;
      const nearBottom =
        scrollHeight - scrollTop - clientHeight < SCROLL_THRESHOLD;

      if (nearBottom) {
        if (!hasMore) return;
        isFetchingRef.current = true; // Lock immediately
        fetchPosts(page);
      }
    };

    scrollDiv.addEventListener("scroll", onScroll);
    return () => scrollDiv.removeEventListener("scroll", onScroll);
  }, [hasMore]);

  const year = t("year");
  const month = t("month");
  const day = t("day");
  const hour = t("hour");
  const minute = t("minute");
  const ago = t("ago");
  const justNow = t("just_now");

  return (
    <div ref={scrollDivRef} className="max-w-3xl h-60 sm:h-80 overflow-y-auto">
      {notifications.items &&
        (notifications.items.length == 0 ? (
          <h1 className="text-center py-4">{t("no_notification")}</h1>
        ) : (
          notifications.items.map((item: Notification, index: number) => (
            <DropdownMenuItem
              className={cn(
                "rtl:justify-end rounded-none hover:bg-primary/5",
                index !== 0 && "border-t"
              )}
              key={`${item.id}-${index}`}
            >
              <NotificationItem
                item={item}
                year={year}
                month={month}
                day={day}
                hour={hour}
                minute={minute}
                ago={ago}
                justNow={justNow}
              />
            </DropdownMenuItem>
          ))
        ))}

      {(isFetchingRef.current || !notifications.items) && (
        <p className="text-center text-gray-500 py-2 mt-auto font-medium">
          {t("loading")}...
        </p>
      )}

      {!hasMore && page > 2 && (
        <p className="text-center rtl:text-sm-rtl ltr:text-md-ltr text-primary/70 py-2 font-semibold">
          {t("you_reached_end")}
        </p>
      )}
    </div>
  );
};

export default InfiniteScrollOnGivenDiv;
