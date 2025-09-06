import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { t } from "i18next";
import { useEffect, useState } from "react";
import { setServerError, validate } from "@/validation/validation";
import axiosClient from "@/lib/axois-client";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import type { UserPermission } from "@/database/models";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import StaffInputs from "@/views/pages/auth-features/about/tabs/parts/staff-inputs";

interface AboutOfficeTabProps {
  permission: UserPermission;
}
export default function AboutOfficeTab(props: AboutOfficeTabProps) {
  const { permission } = props;

  const [loading, setLoading] = useState(false);
  const [manipulating, setManipulating] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    address_english: "",
    address_farsi: "",
    address_pashto: "",
    contact: "",
    email: "",
    optional_lang: "",
    editable: false,
  });
  const [error, setError] = useState<Map<string, string>>(new Map());

  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("about/office-detail");
      if (response.status == 200) {
        // 1. Add data to list
        if (response.data.office) {
          const data = response.data.office;
          const item = {
            id: data.id,
            picture: data.picture,
            address_english: data.address_english,
            address_farsi: data.address_farsi,
            address_pashto: data.address_pashto,
            contact: data.contact,
            email: data.email,
            optional_lang: "",
            editable: true,
          };
          setUserData(item);
        }
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
  const saveData = async () => {
    if (loading) {
      return;
    }
    setManipulating(true);
    // 1. Validate form
    const passed = await validate(
      [
        {
          name: "address_english",
          rules: ["required", "max:100", "min:3"],
        },
        {
          name: "address_farsi",
          rules: ["required", "max:100", "min:3"],
        },
        {
          name: "address_pashto",
          rules: ["required", "max:100", "min:3"],
        },
        {
          name: "contact",
          rules: ["required", "phone"],
        },
        {
          name: "email",
          rules: ["required"],
        },
      ],
      userData,
      setError
    );
    if (!passed) {
      setManipulating(false);
      return;
    }
    // 2. Store
    const data = {
      id: userData.id,
      address_english: userData.address_english,
      address_pashto: userData.address_pashto,
      address_farsi: userData.address_farsi,
      contact: userData.contact,
      email: userData.email,
    };

    try {
      const response = userData.editable
        ? await axiosClient.put("about/office", data)
        : await axiosClient.post("about/office", data);
      if (response.status == 200) {
        toast.success(response.data.message);
      }
    } catch (error: any) {
      toast.error(error.response.data.message);

      setServerError(error.response.data.errors, setError);
      console.log(error);
    } finally {
      setManipulating(false);
    }
  };

  const hasEdit = permission.sub.get(PermissionEnum.about.sub.office)?.edit;
  const hasAdd = permission.sub.get(PermissionEnum.about.sub.office)?.add;

  return (
    <Card className="xxl:w-[90%] md:w-[70%] lg:w-1/2 mx-auto">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-4xl-ltr text-tertiary text-start">
          {t("office")}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("general_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-8">
        {loading ? (
          <NastranSpinner />
        ) : (
          <StaffInputs
            inputName={"address"}
            setUserData={setUserData}
            userData={userData}
            error={error}
            manipulating={manipulating}
            saveData={saveData}
            hasEdit={hasEdit}
            hasAdd={hasAdd}
            multiTabPlaceholder={"address"}
          />
        )}
      </CardContent>
    </Card>
  );
}
