import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosClient from "@/lib/axois-client";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import { RefreshCcw } from "lucide-react";
import { useParams } from "react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import EditDonorStatusDialog from "./parts/edit-donor-status-dialog";
import { toLocaleDate } from "@/lib/utils";
import { useGlobalState } from "@/context/GlobalStateContext";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import type { DonorStatus, UserPermission } from "@/database/models";
import { toast } from "sonner";
import { PermissionEnum, StatusEnum } from "@/database/model-enums";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
interface EditStatusTabProps {
  permissions: UserPermission;
}
export default function EditStatusTab(props: EditStatusTabProps) {
  const { permissions } = props;
  const { t } = useTranslation();
  const { id } = useParams();
  const [state] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [donorStatuses, setDonorStatuses] = useState<DonorStatus[]>([]);
  const initialize = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 2. Send data
      const response = await axiosClient.get(`statuses/donor/${id}`);
      if (response.status === 200) {
        const fetch = response.data.statuses as DonorStatus[];
        setDonorStatuses(fetch);
        if (failed) setFailed(false);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    initialize();
  }, []);

  const add = (donorStatus: DonorStatus) => {
    const updatedUnFiltered = donorStatuses.map((item) => {
      return { ...item, is_active: 0 };
    });
    setDonorStatuses([donorStatus, ...updatedUnFiltered]);
  };

  const donor_status = permissions.sub.get(PermissionEnum.donor.sub.status);
  const hasEdit = donor_status?.edit;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("status")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-x-4 gap-y-6 w-full xl:w-1/">
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : (
          <>
            {hasEdit && (
              <NastranModel
                size="lg"
                isDismissable={false}
                className="py-8"
                button={
                  <PrimaryButton className="text-primary-foreground">
                    {t("change_status")}
                  </PrimaryButton>
                }
                showDialog={async () => true}
              >
                <EditDonorStatusDialog onComplete={add} />
              </NastranModel>
            )}
            <Table className="w-full border">
              <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-start">{t("id")}</TableHead>
                  <TableHead className="text-start">{t("name")}</TableHead>
                  <TableHead className="text-start">{t("status")}</TableHead>
                  <TableHead className="text-start">{t("saved_by")}</TableHead>
                  <TableHead className="text-start">{t("comment")}</TableHead>
                  <TableHead className="text-start">{t("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="rtl:text-xl-rtl ltr:text-lg-ltr">
                {loading ? (
                  <>
                    <TableRow>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  donorStatuses.map(
                    (donorStatus: DonorStatus, index: number) => (
                      <TableRow key={index}>
                        <TableCell>{donorStatus.id}</TableCell>
                        <TableCell>
                          <BooleanStatusButton
                            className="mx-0"
                            getColor={function (): {
                              style: string;
                              value?: string;
                            } {
                              return StatusEnum.registered ===
                                donorStatus.status_id
                                ? {
                                    style: "border-green-500/90",
                                    value: donorStatus.name,
                                  }
                                : StatusEnum.block == donorStatus.status_id
                                ? {
                                    style: "border-red-500",
                                    value: donorStatus.name,
                                  }
                                : StatusEnum.registration_incomplete ==
                                  donorStatus.status_id
                                ? {
                                    style: "border-blue-500/90",
                                    value: donorStatus.name,
                                  }
                                : {
                                    style: "border-orange-500",
                                    value: donorStatus.name,
                                  };
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <BooleanStatusButton
                            className="mx-0"
                            getColor={function (): {
                              style: string;
                              value?: string;
                            } {
                              return donorStatus.is_active === 1
                                ? {
                                    style: "border-green-500/90",
                                    value: t("currently"),
                                  }
                                : {
                                    style: "border-red-500",
                                    value: t("formerly"),
                                  };
                            }}
                          />
                        </TableCell>
                        <TableCell className="truncate max-w-44">
                          {donorStatus.username}
                        </TableCell>
                        <TableCell className="truncate max-w-44">
                          {donorStatus.comment}
                        </TableCell>
                        <TableCell className="truncate">
                          {toLocaleDate(
                            new Date(donorStatus.created_at),
                            state
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  )
                )}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>

      {failed && (
        <CardFooter>
          <PrimaryButton
            disabled={loading}
            onClick={async () => await initialize()}
            className={`${
              loading && "opacity-90"
            } bg-red-500 hover:bg-red-500/70`}
            type="submit"
          >
            <ButtonSpinner loading={loading}>
              {t("failed_retry")}
              <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
            </ButtonSpinner>
          </PrimaryButton>
        </CardFooter>
      )}
    </Card>
  );
}
