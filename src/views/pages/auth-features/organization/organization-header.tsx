import HeaderCard from "@/components/custom-ui/resuseable/header-card";
import axiosClient from "@/lib/axois-client";
import {
  UserRoundPen,
  UserRoundPlus,
  UserRoundX,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export default function OrganizationHeader() {
  const { t } = useTranslation();
  const [recordCount, setRecordCount] = useState({
    activeCount: 0,
    unRegisteredCount: 0,
    count: 0,
    todayCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const fetchCount = async () => {
    try {
      const response = await axiosClient.get(`/organizations/statistics`);
      if (response.status == 200) {
        setRecordCount({
          activeCount: response.data.counts.activeCount,
          unRegisteredCount: response.data.counts.unRegisteredCount,
          count: response.data.counts.count,
          todayCount: response.data.counts.todayCount,
        });
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
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
        title={t("total")}
        total={recordCount.count}
        description1={t("total")}
        description2={t("organization")}
        icon={
          <UsersRound className=" size-[22px] bg-tertiary rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("total_registered_today")}
        total={recordCount.todayCount}
        description1={t("total")}
        description2={t("organization")}
        icon={
          <UserRoundPlus className=" size-[22px] bg-orange-500 rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("active")}
        total={recordCount.activeCount}
        description1={t("total")}
        description2={t("organization")}
        icon={
          <UserRoundX className=" size-[22px] bg-red-500 rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("un_registered")}
        total={recordCount.unRegisteredCount}
        description1={t("total")}
        description2={t("organization")}
        icon={
          <UserRoundPen className=" size-[22px] bg-green-500 rounded-sm p-1 text-secondary" />
        }
      />
    </div>
  );
}
