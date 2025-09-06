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

export default function ProjectHeader() {
  const { t } = useTranslation();
  const [recordCount, setRecordCount] = useState({
    total_projects: 0,
    total_budget: null,
    total_direct_beneficiaries: 0,
    total_in_direct_beneficiaries: 0,
  });
  const [loading, setLoading] = useState(true);
  const fetchCount = async () => {
    try {
      const response = await axiosClient.get(`/projects/statistics`);
      if (response.status == 200) {
        setRecordCount({
          total_projects: response.data.counts.total_projects,
          total_budget: response.data.counts.total_budget,
          total_direct_beneficiaries:
            response.data.counts.total_direct_beneficiaries,
          total_in_direct_beneficiaries:
            response.data.counts.total_in_direct_beneficiaries,
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
        title={t("projects")}
        total={recordCount.total_projects}
        description1={t("total")}
        description2={t("project")}
        icon={
          <UsersRound className=" size-[22px] bg-tertiary rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("budget")}
        total={recordCount.total_budget}
        description1={t("total")}
        description2={t("budget")}
        icon={
          <UserRoundPlus className=" size-[22px] bg-orange-500 rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("direct_benefi")}
        total={recordCount.total_direct_beneficiaries}
        description1={t("total")}
        description2={t("beneficiary")}
        icon={
          <UserRoundX className=" size-[22px] bg-red-500 rounded-sm p-1 text-secondary" />
        }
      />
      <HeaderCard
        loading={loading}
        title={t("in_direct_benefi")}
        total={recordCount.total_in_direct_beneficiaries}
        description1={t("total")}
        description2={t("beneficiary")}
        icon={
          <UserRoundPen className=" size-[22px] bg-green-500 rounded-sm p-1 text-secondary" />
        }
      />
    </div>
  );
}
