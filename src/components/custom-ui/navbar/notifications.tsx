import { Bell } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import axiosClient from "@/lib/axois-client";
import type { Notification } from "@/database/models";
import { toast } from "sonner";
import { useSocketEvent } from "@/hook/use-socket-event";
import { cn, getLangCode } from "@/lib/utils";
import { useNavigate } from "react-router";

import InfiniteScrollOnGivenDiv from "@/components/custom-ui/resuseable/scroll-notification-with-fetch";
const PAGE_SIZE = 10;
const SCROLL_THRESHOLD = 100;
function Notifications() {
  const { t, i18n } = useTranslation();
  const isFetchingRef = useRef(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [initialized, setInitialized] = useState(false);

  const [notifications, setNotifications] = useState<{
    items: Notification[] | undefined;
    submitted: boolean;
    unreadCount: number;
  }>({
    items: undefined,
    submitted: true,
    unreadCount: 0,
  });
  const [storing, setStoring] = useState<boolean>(false);
  const onNotification = (data: any) => {
    try {
      const message = {
        message: data?.message[getLangCode(i18n.language)],
        notifier_id: data?.notifier_id,
        created_at: data?.created_at,
        action_url: data?.action_url,
      } as Notification;
      setNotifications((prev) => ({
        submitted: false,
        unreadCount: prev.unreadCount == 0 ? 1 : prev.unreadCount + 1,
        items: [message, ...(prev.items ?? [])],
      }));
    } catch (e) {}
  };
  useSocketEvent("notification", onNotification);

  const direction = i18n.dir();
  const notificationReadSubmit = async () => {
    if (storing) return;

    if (!notifications.submitted && notifications.items) {
      try {
        setStoring(true);
        const response = await axiosClient.put("notifications");
        if (response.status == 200) {
          setNotifications((prev) => ({
            ...prev,
            items: (prev.items ?? []).map((item) =>
              !item.is_read ? { ...item, is_read: true } : item
            ),
            submitted: true,
            unreadCount: 0,
          }));
        }
      } catch (error: any) {
        console.log(error);
        toast.error(error.response.data.message);
      } finally {
        setStoring(false);
      }
    }
  };
  const fetchPosts = async (pageNumber: number, wipe: boolean = false) => {
    try {
      const res = await axiosClient.get(
        `notifications?_limit=${PAGE_SIZE}&_page=${pageNumber}`
      );
      const data: Notification[] = res.data.notifications;

      if (wipe) {
        setNotifications(() => ({
          items: data,
          submitted: res.data?.unread_count == 0 ? true : false,
          unreadCount: res.data?.unread_count,
        }));
      } else {
        setNotifications((prev) => ({
          items: [...(prev.items ?? []), ...data],
          submitted: res.data?.unread_count == 0 ? true : false,
          unreadCount: res.data?.unread_count,
        }));
      }

      if (data.length < PAGE_SIZE) {
        setHasMore(false);
      } else if (wipe) setHasMore(true);
    } catch (e) {
      console.error("Error fetching posts", e);
    } finally {
      isFetchingRef.current = false; // Unlock after fetch
      setPage(pageNumber + 1);
    }
  };
  useEffect(() => {
    isFetchingRef.current = true; // Lock immediately

    if (initialized) {
      fetchPosts(1, true);
    } else {
      fetchPosts(page, false);
      setInitialized(true);
    }
  }, [i18n.language]);

  return (
    <DropdownMenu dir={direction} onOpenChange={notificationReadSubmit}>
      <DropdownMenuTrigger asChild>
        <div className="ltr:mr-3 rtl:ml-2 mt-[6px] relative select-none cursor-pointer">
          <Bell className="fill-primary size-[18px]" />
          {notifications.unreadCount != 0 && (
            <h1 className="absolute my-auto top-[-6px] ltr:right-[-6px] rtl:right-[-6px] shadow-md font-bold min-h-[16px] max-w-[18px] min-w-[17px] text-center text-primary-foreground bg-red-400 text-[10px] rounded-full">
              {notifications.unreadCount}
            </h1>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-h-fit p-0 w-[200px] sm:w-[300px] backdrop-blur-md z-40 overflow-y-auto">
        <DropdownMenuLabel className="rtl:text-md-rtl pt-3 ltr:text-xl-ltr font-semibold">
          {t("notifications")}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <InfiniteScrollOnGivenDiv
          notifications={notifications}
          isFetchingRef={isFetchingRef}
          SCROLL_THRESHOLD={SCROLL_THRESHOLD}
          fetchPosts={fetchPosts}
          hasMore={hasMore}
          page={page}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const NotificationItem = ({
  item,
  year,
  month,
  day,
  hour,
  minute,
  ago,
  justNow,
}: {
  item: Notification;
  year: any;
  month: any;
  day: any;
  hour: any;
  minute: any;
  ago: any;
  justNow: any;
}) => {
  const navigate = useNavigate();

  const calculateCreatedHours = (createdAt: string): string => {
    const createdDate = new Date(createdAt);
    const currentDate = new Date();
    const diffInMs = currentDate.getTime() - createdDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60)); // Convert milliseconds to minutes
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60)); // Convert milliseconds to hours
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert milliseconds to days
    const diffInMonths = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 30)); // Approximate months
    const diffInYears = Math.floor(diffInMs / (1000 * 60 * 60 * 24 * 365)); // Approximate years

    if (diffInYears > 0) {
      return `${diffInYears} ${year} ${ago}`;
    } else if (diffInMonths > 0) {
      return `${diffInMonths} ${month} ${ago}`;
    } else if (diffInDays > 0) {
      return `${diffInDays} ${day} ${ago}`;
    } else if (diffInHours > 0) {
      return `${diffInHours} ${hour} ${ago}`;
    } else if (diffInMinutes > 0) {
      return `${diffInMinutes} ${minute} ${ago}`;
    } else {
      return justNow;
    }
  };
  return (
    <div
      className={cn(
        "flex flex-col cursor-pointer items-start p-1 gap-x-[2px] w-full relative rtl:text-sm-rtl pt-3 ltr:text-xl-ltr",
        !item.is_read && "bg-slate-400/15 rounded-md"
      )}
      onClick={() => {
        if (item.action_url) navigate(item.action_url, { replace: true });
      }}
    >
      <h1 className="flex-1 line-clamp-2">{item.message}</h1>
      <h1 className="text-primary/80">
        {calculateCreatedHours(item.created_at)}
      </h1>
    </div>
  );
};
export default memo(Notifications);
