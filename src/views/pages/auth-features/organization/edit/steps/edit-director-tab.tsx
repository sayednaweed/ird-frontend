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
import EditDirectorDialog from "./parts/edit-director-dialog";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ButtonSpinner from "@/components/custom-ui/spinner/ButtonSpinner";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import type { Director, UserPermission } from "@/database/models";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";
import { PermissionEnum } from "@/database/model-enums";
import { toast } from "sonner";
interface EditDirectorTabProps {
  permissions: UserPermission;
  registerationExpired: boolean;
}
export default function EditDirectorTab(props: EditDirectorTabProps) {
  const { permissions, registerationExpired } = props;
  const { t } = useTranslation();
  let { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<{
    visible: boolean;
    director: Director | undefined;
  }>({
    visible: false,
    director: undefined,
  });
  const [directors, setDirectors] = useState<Director[]>([]);
  const initialize = async () => {
    try {
      if (loading) return;
      setLoading(true);

      // 2. Send data
      const response = await axiosClient.get(`organizations/directors/${id}`);
      if (response.status === 200) {
        const fetch = response.data.directors as Director[];
        setDirectors(fetch);
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

  const add = (director: Director) => {
    if (director.is_active) {
      const updatedUnFiltered = directors.map((item) => {
        return { ...item, is_active: false };
      });
      setDirectors([director, ...updatedUnFiltered]);
    } else {
      setDirectors([director, ...directors]);
    }
  };
  const update = (director: Director) => {
    let updatedUnFiltered = [];
    if (director.is_active) {
      updatedUnFiltered = directors.map((item) =>
        item.id == director.id ? director : { ...item, is_active: false }
      );
    } else {
      updatedUnFiltered = directors.map((item) =>
        item.id == director.id ? director : item
      );
    }
    setDirectors(updatedUnFiltered);
  };

  const information = permissions.sub.get(
    PermissionEnum.organization.sub.director_information
  );
  const hasAdd = information?.add;
  const hasEdit = information?.edit;
  const hasView = information?.view;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="rtl:text-3xl-rtl ltr:text-2xl-ltr">
          {t("director_information")}
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
                visible={selected.visible}
                key={`${selected.visible}`}
                isDismissable={false}
                className="py-8"
                button={
                  <PrimaryButton className="text-primary-foreground">
                    {t("change_dir")}
                  </PrimaryButton>
                }
                showDialog={async () => true}
              >
                <EditDirectorDialog
                  hasEdit={hasEdit}
                  director={selected.director}
                  onComplete={(direcotr: Director, isEdit: boolean) =>
                    isEdit ? update(direcotr) : add(direcotr)
                  }
                  onCancel={() => {
                    if (selected.visible)
                      setSelected({ visible: false, director: undefined });
                  }}
                />
              </NastranModel>
            )}

            <Table className="w-full border">
              <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-start">{t("id")}</TableHead>
                  <TableHead className="text-start">{t("name")}</TableHead>
                  <TableHead className="text-start">{t("status")}</TableHead>
                  <TableHead className="text-start">{t("email")}</TableHead>
                  <TableHead className="text-start">{t("contact")}</TableHead>
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
                    </TableRow>
                  </>
                ) : (
                  directors.map((director: Director) => (
                    <TableRowIcon
                      read={hasView}
                      remove={false}
                      edit={false}
                      onEdit={async () => {}}
                      key={director.id}
                      item={director}
                      onRemove={async () => {}}
                      onRead={async (director: Director) => {
                        setSelected({
                          visible: true,
                          director: director,
                        });
                      }}
                    >
                      <TableCell className="font-medium">
                        {director.id}
                      </TableCell>
                      <TableCell>{director.name}</TableCell>
                      <TableCell>
                        <BooleanStatusButton
                          getColor={function (): {
                            style: string;
                            value?: string;
                          } {
                            return director.is_active
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
                      <TableCell className="text-[15px]">
                        {director.email}
                      </TableCell>
                      <TableCell
                        className=" rtl:text-end text-[15px]"
                        dir="ltr"
                      >
                        {director.contact}
                      </TableCell>
                    </TableRowIcon>
                  ))
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
