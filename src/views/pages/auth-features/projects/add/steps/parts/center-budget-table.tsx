import { useContext, useState } from "react";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import CenterBudgetHeader from "./center-budget-header";
import type { CenterBudget } from "@/database/models";
import { toast } from "sonner";
import { budgetFailed } from "@/lib/utils";

export interface CenterBudgetTableProps {
  userData?: any;
  setUserData?: any;
}
export default function CenterBudgetTable(props: CenterBudgetTableProps) {
  // const { userData, setUserData } = useContext(StepperContext);
  const context = useContext(StepperContext);

  const userData = props.userData ?? context.userData;
  const setUserData = props.setUserData ?? context.setUserData;
  const [onEdit, setOnEdit] = useState<CenterBudget | undefined>();
  const { t } = useTranslation();

  const onCenterComplete = (center: CenterBudget) => {
    const centers = userData.centers_list;
    if (centers) {
      const alreadyExists = centers.some(
        (v: CenterBudget) => v?.province?.id === center?.province?.id
      );
      if (alreadyExists) {
        toast.error(t("province_exist"));
        return true;
      } else {
        let totalProvince = 0;
        for (const center of centers) {
          totalProvince += Number(center?.budget);
        }
        totalProvince += Number(center?.budget);
        if (budgetFailed(userData?.budget, totalProvince, t)) return true;
        setUserData((prev: any) => ({
          ...prev,
          centers_list: [...prev.centers_list, center],
        }));
      }
    } else {
      if (budgetFailed(userData?.budget, center?.budget, t)) return true;
      setUserData((prev: any) => ({
        ...prev,
        centers_list: [center],
      }));
    }
    // Clear inpput data
    return false;
  };
  const removeCenter = (id: string) => {
    setUserData((prev: any) => ({
      ...prev,
      centers_list: prev.centers_list.filter(
        (center: CenterBudget) => center.id !== id
      ),
    }));
  };
  const onEditComplete = (updatedVac: CenterBudget) => {
    const centers = userData.centers_list;

    if (centers) {
      const alreadyExists = centers.some(
        (v: CenterBudget) => v?.province?.id === updatedVac?.province?.id
      );
      if (alreadyExists) {
        toast.error(t("province_exist"));
        // do not clear input data
        return true;
      }
      let totalProvince: number = 0;
      for (const center of centers) {
        totalProvince += Number(center?.budget);
      }
      totalProvince += Number(updatedVac?.budget);

      if (budgetFailed(userData?.budget, totalProvince, t)) return true;
      setUserData((prev: any) => {
        const filtered = prev.centers_list.filter(
          (v: CenterBudget) => v.id !== updatedVac.id
        );

        return {
          ...prev,
          centers_list: [...filtered, updatedVac],
        };
      });
      setOnEdit(undefined);
      // Clear inpput data
    } else {
      if (budgetFailed(userData?.budget, updatedVac?.budget, t)) return true;
    }
    return false;
  };
  const editCenter = (cent: CenterBudget) => {
    const deepCopy = JSON.parse(JSON.stringify(cent));
    setOnEdit(deepCopy); // Just set for editing, don't remove yet
    setUserData((prev: any) => ({
      ...prev,
      centers_list: prev.centers_list.filter(
        (center: CenterBudget) => center?.id !== cent?.id
      ),
    }));
  };

  return (
    <div className="flex flex-col col-span-full gap-x-4 xl:gap-x-12 mt-4 gap-y-3 w-full lg:w-full">
      <CenterBudgetHeader
        editCenter={onEdit}
        onEditComplete={onEditComplete}
        onComplete={onCenterComplete}
      />
      <div className="col-span-full flex flex-col border-t mt-12 pt-6 space-y-4 pb-12 relative">
        <h1 className="absolute text-tertiary font-bold ltr:text-[22px] bg-card -top-5">
          {t("centers")}
        </h1>
        <Table className="bg-card rounded-md">
          <TableHeader className="rtl:text-3xl-rtl ltr:text-xl-ltr bg-primary/5">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="text-start">{t("province")}</TableHead>
              <TableHead className="text-start">{t("budget")}</TableHead>
              <TableHead className="text-start">{t("direct_benefi")}</TableHead>
              <TableHead className="text-start">
                {t("in_direct_benefi")}
              </TableHead>
              <TableHead className="text-center">{t("action")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="rtl:text-xl-rtl ltr:text-2xl-ltr">
            {userData.centers_list &&
              userData.centers_list.map((item: CenterBudget) => (
                <TableRow key={item.id}>
                  <TableCell className="text-start truncate">
                    {item.province?.name}
                  </TableCell>
                  <TableCell className="text-start truncate">
                    {item.budget}
                  </TableCell>
                  <TableCell className="text-start truncate">
                    {item.direct_benefi}
                  </TableCell>
                  <TableCell className="text-start truncate">
                    {item.in_direct_benefi}
                  </TableCell>
                  <TableCell className="flex gap-x-2 justify-center items-center">
                    <Trash2
                      onClick={() => removeCenter(item.id)}
                      className="text-red-400 size-[18px] transition cursor-pointer"
                    />
                    <Edit
                      onClick={() => editCenter(item)}
                      className="text-green-500 size-[18px] transition cursor-pointer"
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
