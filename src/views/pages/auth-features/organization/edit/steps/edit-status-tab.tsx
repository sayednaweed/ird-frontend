import NastranModel from "@/components/custom-ui/model/NastranModel";
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
import { toLocaleDate } from "@/lib/utils";
import { useGlobalState } from "@/context/GlobalStateContext";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import type { OrganizationStatus, UserPermission } from "@/database/models";
import { toast } from "sonner";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { PermissionEnum, StatusEnum } from "@/database/model-enums";
import EditOrganizationStatusDialog from "@/views/pages/auth-features/organization/edit/steps/parts/edit-organization-status-dialog";
interface EditStatusTabProps {
  permissions: UserPermission;
  registerationExpired: boolean;
}
export default function EditStatusTab(props: EditStatusTabProps) {
  const { permissions, registerationExpired } = props;
  const { t } = useTranslation();
  const { id } = useParams();
  const [state] = useGlobalState();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [organizationStatuses, setOrganizationStatuses] = useState<
    OrganizationStatus[]
  >([]);
  const initialize = async () => {
    try {
      if (loading) return;
      setLoading(true);
      // 2. Send data
      const response = await axiosClient.get(`statuses/organization/${id}`);
      if (response.status === 200) {
        const fetch = response.data.statuses as OrganizationStatus[];
        setOrganizationStatuses(fetch);
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

  const add = (organizationStatus: OrganizationStatus) => {
    if (organizationStatus.is_active == 1) {
      const updatedUnFiltered = organizationStatuses.map((item) => {
        return { ...item, is_active: 0 };
      });
      setOrganizationStatuses([organizationStatus, ...updatedUnFiltered]);
    } else {
      setOrganizationStatuses([organizationStatus, ...organizationStatuses]);
    }
  };

  const perm = permissions.sub.get(PermissionEnum.organization.sub.status);
  const hasEdit = perm?.edit;
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
            {!registerationExpired && hasEdit && (
              <NastranModel
                size="md"
                isDismissable={false}
                className="py-8"
                button={
                  <PrimaryButton className="text-primary-foreground">
                    {t("change_status")}
                  </PrimaryButton>
                }
                showDialog={async () => true}
              >
                <EditOrganizationStatusDialog onComplete={add} />
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
                  organizationStatuses.map(
                    (organizationStatus: OrganizationStatus) => (
                      <TableRow key={organizationStatus.id}>
                        <TableCell>{organizationStatus.id}</TableCell>
                        <TableCell>
                          <BooleanStatusButton
                            getColor={function (): {
                              style: string;
                              value?: string;
                            } {
                              return StatusEnum.registered ===
                                organizationStatus.status_type_id
                                ? {
                                    style: "border-green-500/90",
                                    value: organizationStatus.name,
                                  }
                                : StatusEnum.block ==
                                  organizationStatus.status_type_id
                                ? {
                                    style: "border-red-500",
                                    value: organizationStatus.name,
                                  }
                                : StatusEnum.registration_incomplete ==
                                  organizationStatus.status_type_id
                                ? {
                                    style: "border-blue-500/90",
                                    value: organizationStatus.name,
                                  }
                                : {
                                    style: "border-orange-500",
                                    value: organizationStatus.name,
                                  };
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <BooleanStatusButton
                            getColor={function (): {
                              style: string;
                              value?: string;
                            } {
                              return organizationStatus.is_active
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
                          {organizationStatus.userable_type}
                        </TableCell>
                        <TableCell className="truncate max-w-44">
                          {organizationStatus.comment}
                        </TableCell>
                        <TableCell className="truncate">
                          {toLocaleDate(
                            new Date(organizationStatus.created_at),
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
            className={`${loading && "opacity-90"} bg-red-500 hover:bg-red-500`}
            type="submit"
          >
            <ButtonSpinner loading={loading}>
              {t("failed")}
              <RefreshCcw className="ltr:ml-2 rtl:mr-2" />
            </ButtonSpinner>
          </PrimaryButton>
        </CardFooter>
      )}
    </Card>
  );
}
