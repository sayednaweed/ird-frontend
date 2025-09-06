import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { t } from "i18next";
import { useEffect, useState, type ChangeEvent } from "react";
import { setServerError, validate } from "@/validation/validation";
import axiosClient from "@/lib/axois-client";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import { Pencil } from "lucide-react";
import NastranSpinner from "@/components/custom-ui/spinner/NastranSpinner";
import type { IStaffSingle, UserPermission } from "@/database/models";
import { toast } from "sonner";
import { isFile, validateFile } from "@/lib/utils";
import { PermissionEnum } from "@/database/model-enums";
import IconButton from "@/components/custom-ui/button/icon-button";
import StaffInputs from "@/views/pages/auth-features/about/tabs/parts/staff-inputs";

interface AboutFormProps {
  permission: UserPermission;
  getUrl: string;
  postUrl: string;
  putUrl: string;
  title: string;
  valueUserData?: IStaffSingle;
  onComplete?: (response: any, editable: boolean) => void;
}
export default function AboutForm(props: AboutFormProps) {
  const {
    permission,
    postUrl,
    putUrl,
    getUrl,
    title,
    onComplete,
    valueUserData,
  } = props;
  const [loading, setLoading] = useState(false);
  const [manipulating, setManipulating] = useState(false);
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
  const [error, setError] = useState<Map<string, string>>(new Map());

  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(getUrl);
      if (response.status == 200) {
        // 1. Add data to list
        if (response.data) {
          const data = response.data;
          const item = {
            id: data.id,
            picture: data.picture,
            name_english: data.name_english,
            name_farsi: data.name_farsi,
            name_pashto: data.name_pashto,
            contact: data.contact,
            email: data.email,
            optional_lang: "",
            imageUrl: "",
            editable: true,
          };
          setUserData(item as IStaffSingle);
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
    if (!valueUserData) initialize();
    else setUserData(valueUserData);
  }, [valueUserData]);
  const saveData = async () => {
    if (loading) {
      return;
    }
    setManipulating(true);
    // 1. Validate form
    const passed = await validate(
      [
        {
          name: "name_english",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "name_farsi",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "name_pashto",
          rules: ["required", "max:45", "min:3"],
        },
        {
          name: "contact",
          rules: ["required"],
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
    const formData = new FormData();
    formData.append("id", userData.id);
    formData.append("name_english", userData.name_english);
    formData.append("name_farsi", userData.name_farsi);
    formData.append("name_pashto", userData.name_pashto);
    formData.append("contact", userData.contact);
    formData.append("email", userData.email);
    if (userData.picture) formData.append("picture", userData.picture);

    try {
      const response = userData.editable
        ? await axiosClient.post(putUrl, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            params: {
              _method: "PUT", // Laravel treats this POST as a PUT
            },
          })
        : await axiosClient.post(postUrl, formData);
      if (response.status == 200) {
        if (onComplete) onComplete(response, valueUserData ? true : false);
        else {
          const staff = response.data.staff;
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
        }
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

  const onFileUploadChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const maxFileSize = 2 * 1024 * 1024; // 2MB

    const validTypes: string[] = ["image/jpeg", "image/png", "image/jpg"];
    const fileInput = e.target;
    if (!fileInput.files || fileInput.files.length === 0) {
      return;
    }

    const checkFile = fileInput.files[0] as File;
    const file = validateFile(
      checkFile,
      Math.round(maxFileSize),
      validTypes,
      t
    );
    if (file) {
      const imageUrl = URL.createObjectURL(file); // Create a temporary URL for the image
      setUserData({
        ...userData,
        picture: file,
        imageUrl: imageUrl,
      });
      /** Reset file input */
      if (e.currentTarget) {
        e.currentTarget.type = "text";
        e.currentTarget.type = "file"; // Reset to file type
      }
    }
  };
  const hasEdit = permission.sub.get(PermissionEnum.about.sub.director)?.edit;
  const hasAdd = permission.sub.get(PermissionEnum.about.sub.director)?.add;

  return (
    <Card className="xxl:w-[90%] md:w-[70%] lg:w-1/2 mx-auto shadow-none bg-card">
      <CardHeader className="relative text-start">
        <CardTitle className="rtl:text-4xl-rtl ltr:text-4xl-ltr text-tertiary text-start">
          {t(title)}
        </CardTitle>
        <CardDescription className="rtl:text-xl-rtl ltr:text-lg-ltr">
          {t("general_desc")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-8">
        {loading ? (
          <NastranSpinner />
        ) : (
          <>
            <div className="flex flex-col justify-center gap-y-2">
              {isFile(userData.picture) ? (
                <img
                  src={userData.imageUrl}
                  className="size-[86px] !mt-6 mx-auto shadow-lg border border-primary/30 rounded-full"
                />
              ) : (
                <CachedImage
                  src={userData.picture}
                  alt="Avatar"
                  shimmerClassName="size-[86px] !mt-6 mx-auto shadow-lg border border-primary/30 rounded-full"
                  className="size-[86px] !mt-6 object-center object-cover mx-auto shadow-lg border border-primary/50 rounded-full"
                  routeIdentifier={"public"}
                />
              )}

              <IconButton className="hover:bg-primary/20 transition-all text-primary mx-auto">
                <label
                  className={`flex w-fit gap-x-1 items-center cursor-pointer justify-center`}
                >
                  <Pencil className={`size-[13px] pointer-events-none`} />
                  <h1 className={`rtl:text-lg-rtl ltr:text-md-ltr`}>
                    {t("choose")}
                  </h1>
                  <input
                    type="file"
                    className={`block w-0 h-0`}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      onFileUploadChange(e);
                    }}
                  />
                </label>
              </IconButton>
            </div>
            <StaffInputs
              inputName={"name"}
              setUserData={setUserData}
              userData={userData}
              error={error}
              manipulating={manipulating}
              saveData={saveData}
              hasEdit={hasEdit}
              hasAdd={hasAdd}
              multiTabPlaceholder={"detail"}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}
