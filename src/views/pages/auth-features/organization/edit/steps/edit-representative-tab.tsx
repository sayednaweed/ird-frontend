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
import TableRowIcon from "@/components/custom-ui/table/TableRowIcon";
import { useParams } from "react-router";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import EditRepresentorDialog from "./parts/edit-representor-dialog";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import { useGlobalState } from "@/context/GlobalStateContext";
import { toLocaleDate } from "@/lib/utils";
import type { Representor, UserPermission } from "@/database/models";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
interface EditRepresentativeTabProps {
  permissions: UserPermission;
  registerationExpired: boolean;
}
export default function EditRepresentativeTab(
  props: EditRepresentativeTabProps
) {
  const { permissions, registerationExpired } = props;
  const [state] = useGlobalState();
  const { t } = useTranslation();
  let { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<{
    visible: boolean;
    representor: Representor | undefined;
  }>({
    visible: false,
    representor: undefined,
  });
  const [representors, setRepresentors] = useState<Representor[]>([]);
  const initialize = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // 2. Send data
      const response = await axiosClient.get(
        `organizations/representors/${id}`
      );
      if (response.status === 200) {
        const fetch = response.data as Representor[];
        setRepresentors(fetch);
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

  const add = (representor: Representor) => {
    const updatedUnFiltered = representors.map((item) => {
      return { ...item, is_active: false };
    });
    setRepresentors([representor, ...updatedUnFiltered]);
  };
  const update = (representor: Representor) => {
    let updatedUnFiltered = [];

    if (representor.is_active) {
      updatedUnFiltered = representors.map((item) =>
        item.id == representor.id ? representor : { ...item, is_active: false }
      );
    } else {
      updatedUnFiltered = representors.map((item) =>
        item.id == representor.id ? representor : item
      );
    }

    setRepresentors(updatedUnFiltered);
  };

  const information = permissions.sub.get(
    PermissionEnum.organization.sub.representative
  );
  const hasAdd = information?.add;
  const hasEdit = information?.edit;
  const hasView = information?.view;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("representative")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-x-4 gap-y-6 w-full xl:w-1/">
        {failed ? (
          <h1 className="rtl:text-2xl-rtl">{t("u_are_not_authzed!")}</h1>
        ) : (
          <>
            {!registerationExpired && hasAdd && (
              <NastranModel
                size="md"
                isDismissable={false}
                className="py-8"
                visible={selected.visible}
                key={`${selected.visible}`}
                button={
                  <PrimaryButton className="text-primary-foreground">
                    {t("new_represen")}
                  </PrimaryButton>
                }
                showDialog={async () => true}
              >
                <EditRepresentorDialog
                  representor={selected.representor}
                  hasEdit={hasEdit}
                  onComplete={(representor: Representor, isEdit: boolean) => {
                    isEdit ? update(representor) : add(representor);
                    setSelected({ visible: false, representor: undefined });
                  }}
                  onCancel={() =>
                    setSelected({ visible: false, representor: undefined })
                  }
                />
              </NastranModel>
            )}

            <Table className="w-full border">
              <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-start">{t("full_name")}</TableHead>
                  <TableHead className="text-start">{t("status")}</TableHead>
                  <TableHead className="text-start">{t("saved_by")}</TableHead>
                  <TableHead className="text-start">{t("type")}</TableHead>
                  <TableHead className="text-start">
                    {t("agreement_nu")}
                  </TableHead>
                  <TableHead className="text-start">
                    {t("start_date")}
                  </TableHead>
                  <TableHead className="text-start">{t("end_date")}</TableHead>
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
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                      <TableCell>
                        <Shimmer className="h-[24px] bg-primary/30 w-full rounded-sm" />
                      </TableCell>
                    </TableRow>
                  </>
                ) : (
                  representors.map(
                    (representor: Representor, index: number) => (
                      <TableRowIcon
                        read={hasView}
                        remove={false}
                        edit={false}
                        onEdit={async () => {}}
                        key={index}
                        item={representor}
                        onRemove={async () => {}}
                        onRead={async (representor: Representor) => {
                          setSelected({
                            visible: true,
                            representor: representor,
                          });
                        }}
                      >
                        <TableCell className="font-medium">
                          {representor.full_name}
                        </TableCell>
                        <TableCell>
                          <BooleanStatusButton
                            getColor={function (): {
                              style: string;
                              value?: string;
                            } {
                              return representor.is_active
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
                        <TableCell className="font-medium">
                          {representor.saved_by}
                        </TableCell>
                        <TableCell className="font-medium">
                          {representor.userable_type}
                        </TableCell>
                        <TableCell className="font-semibold text-[14px]">
                          {representor.agreement_no}
                        </TableCell>
                        <TableCell className="font-semibold text-[14px]">
                          {representor.start_date
                            ? toLocaleDate(
                                new Date(representor.start_date),
                                state
                              )
                            : ""}
                        </TableCell>
                        <TableCell className="font-semibold text-[14px]">
                          {representor.end_date
                            ? toLocaleDate(
                                new Date(representor.end_date),
                                state
                              )
                            : ""}
                        </TableCell>
                        <TableCell className="font-semibold text-[14px]">
                          {representor.end_date
                            ? toLocaleDate(
                                new Date(representor.created_at),
                                state
                              )
                            : ""}
                        </TableCell>
                      </TableRowIcon>
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
