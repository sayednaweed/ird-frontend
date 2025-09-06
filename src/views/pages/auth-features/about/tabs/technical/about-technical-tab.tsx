import axiosClient from "@/lib/axois-client";
import TechnicalTable from "../parts/technical-table";
import type { IStaffSingle, UserPermission } from "@/database/models";
import { useCallback, useEffect, useState } from "react";
import { PermissionEnum } from "@/database/model-enums";
import { toast } from "sonner";
import Card from "@/components/custom-ui/resuseable/card";
import AboutForm from "@/views/pages/auth-features/about/tabs/parts/about-form";

interface AboutTechnicalTabProps {
  permission: UserPermission;
}
export default function AboutTechnicalTab(props: AboutTechnicalTabProps) {
  const { permission } = props;
  const [technical, setTechnical] = useState<IStaffSingle[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<IStaffSingle>({
    id: "",
    picture: undefined,
    name_english: "",
    name_farsi: "",
    name_pashto: "",
    contact: "",
    email: "",
    optional_lang: "",
    imageUrl: "",
    editable: false,
  });

  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("about/technical-support");
      if (response.status == 200) {
        // 1. Add data to list
        const technicalStaff = response.data;
        setTechnical(technicalStaff as IStaffSingle[]);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);

      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    initialize();
  }, []);

  const onComplete = useCallback((response: any, editable: boolean) => {
    const staff = response.data.staff;
    if (editable) {
      setTechnical((prevTechnical) => {
        return prevTechnical.map((item) =>
          item.id === staff.id ? staff : item
        );
      });
    } else {
      // 1. Add data to list
      setTechnical((prev) => [staff, ...prev]);
    }
    setUserData({
      id: "",
      picture: undefined,
      name_english: "",
      name_farsi: "",
      name_pashto: "",
      contact: "",
      email: "",
      optional_lang: "",
      imageUrl: "",
      editable: false,
    });
  }, []);
  const editOnClick = async (staff: IStaffSingle) => {
    setUserData({
      id: staff.id,
      picture: staff.picture,
      name_english: staff.name_english,
      name_farsi: staff.name_farsi,
      name_pashto: staff.name_pashto,
      contact: staff.contact,
      email: staff.email,
      optional_lang: "",
      imageUrl: "",
      editable: true,
    });
  };

  const deleteOnClick = async (staff: IStaffSingle) => {
    try {
      const response = await axiosClient.delete("staff/" + staff.id);
      if (response.status == 200) {
        const filtered = technical.filter(
          (item: IStaffSingle) => staff.id != item.id
        );
        setTechnical(filtered);
      }
      toast.success(response.data.message);
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const hasEdit = permission.sub.get(
    PermissionEnum.about.sub.technical_sup
  )?.edit;
  const hasRemove = permission.sub.get(
    PermissionEnum.about.sub.technical_sup
  )?.delete;
  const hasView = permission.sub.get(
    PermissionEnum.about.sub.technical_sup
  )?.view;

  return (
    <>
      <AboutForm
        onComplete={onComplete}
        permission={permission}
        valueUserData={userData}
        getUrl={"about/manager"}
        postUrl={"about/technical-support"}
        putUrl={"about/technical-support"}
        title={"technical_sup"}
      />
      <Card className="h-fit xxl:w-[90%] overflow-auto">
        <TechnicalTable
          deleteOnClick={deleteOnClick}
          editOnClick={editOnClick}
          staffs={technical}
          loading={loading}
          hasEdit={hasEdit}
          hasRemove={hasRemove}
          hasView={hasView}
        />
      </Card>
    </>
  );
}
