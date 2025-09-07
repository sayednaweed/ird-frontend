import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ScheduleItem } from "@/database/models";
import { useTranslation } from "react-i18next";

export interface TakePresentationProps {
  scheduleItems: ScheduleItem[];
}

export default function TakePresentation(props: TakePresentationProps) {
  const { scheduleItems } = props;
  const { t } = useTranslation();

  return (
    <Card className="w-full bg-card">
      <Table className="rounded-md w-full">
        <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr bg-primary/5">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="text-start">{t("#")}</TableHead>
            <TableHead className="text-start">{t("project_name")}</TableHead>
            <TableHead className="text-start">{t("action")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
          {scheduleItems.map((item, index: number) => (
            <TableRow key={item.projectId}>
              <TableCell className="text-start truncate">{index + 1}</TableCell>
              <TableCell className="text-start truncate">
                {item.project_name}
              </TableCell>
              <TableCell className="text-start truncate">
                <NastranModel
                  className="bg-card"
                  size="lg"
                  isDismissable={false}
                  button={
                    <PrimaryButton className="items-center">
                      {t("take_presentation")}
                    </PrimaryButton>
                  }
                  showDialog={async () => true}
                >
                  <div>heelo</div>
                </NastranModel>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
