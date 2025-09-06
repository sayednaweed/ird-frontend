import HeaderCard from "@/components/custom-ui/resuseable/header-card";
import axiosClient from "@/lib/axois-client";
import type { UserRecordCount } from "@/lib/types";
import {
  UserRoundPen,
  UserRoundPlus,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function UserHeader() {
  const { t } = useTranslation();
  const [recordCount, setRecordCount] = useState<UserRecordCount>({
    activeUserCount: null,
    inActiveUserCount: null,
    userCount: null,
    todayCount: null,
  });
  const [loading, setLoading] = useState(true);
  const fetchCount = async () => {
    try {
      const response = await axiosClient.get(`users/statistics`);
      if (response.status == 200) {
        setRecordCount({
          activeUserCount: response.data.counts.activeUserCount,
          inActiveUserCount: response.data.counts.inActiveUserCount,
          userCount: response.data.counts.userCount,
          todayCount: response.data.counts.todayCount,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCount();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 justify-items-center gap-y-2 mt-4">
      <HeaderCard
        loading={loading}
        title={t("total_users")}
        total={recordCount.userCount}
        description1={t("total")}
        description2={t("user")}
        icon={
          <UsersRound className=" size-[22px] bg-tertiary rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("total_registered_today")}
        total={recordCount.todayCount}
        description1={t("total")}
        description2={t("user_today")}
        icon={
          <UserRoundPlus className=" size-[22px] bg-orange-500 rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("total_active")}
        total={recordCount.activeUserCount}
        description1={t("total")}
        description2={t("user")}
        icon={
          <UserRoundX className=" size-[22px] bg-red-500 rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("total_inactive")}
        total={recordCount.inActiveUserCount}
        description1={t("total")}
        description2={t("user")}
        icon={
          <UserRoundPen className=" size-[22px] bg-green-500 rounded-sm p-1 text-secondary" />
        }
      />
    </div>
  );
}
