import { Eye, EyeOff, RotateCcwSquare } from "lucide-react";
import { useContext, useState } from "react";
import { StepperContext } from "@/components/custom-ui/stepper/StepperContext";
import { useTranslation } from "react-i18next";
import PasswordInput from "@/components/custom-ui/input/PasswordInput";
import { generatePassword } from "@/lib/generators";
import APICombobox from "@/components/custom-ui/combobox/APICombobox";

export default function AddUserAccount() {
  const { userData, setUserData, error } = useContext(StepperContext);
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div className="flex flex-col mt-10 gap-y-3 w-full lg:w-[60%] 2xl:w-1/3">
      <PasswordInput
        size_="sm"
        name="password"
        lable={t("password")}
        required={true}
        requiredHint={`* ${t("required")}`}
        defaultValue={userData["password"] ? userData["password"] : ""}
        onChange={handleChange}
        placeholder={t("enter_password")}
        errorMessage={error.get("password")}
        startContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={() => setIsVisible(!isVisible)}
          >
            {isVisible ? (
              <Eye className="size-[20px] text-primary-icon pointer-events-none" />
            ) : (
              <EyeOff className="size-[20px] pointer-events-none" />
            )}
          </button>
        }
        endContent={
          <button
            className="focus:outline-none"
            type="button"
            onClick={() => {
              const generatedPassword = generatePassword();
              setUserData({ ...userData, password: generatedPassword });
            }}
          >
            <RotateCcwSquare className="size-[20px] pointer-events-none" />
          </button>
        }
        type={isVisible ? "text" : "password"}
      />

      <APICombobox
        placeholderText={t("search_item")}
        errorText={t("no_item")}
        onSelect={(selection: any) =>
          setUserData({
            ...userData,
            ["role"]: selection,
            permissions: undefined,
          })
        }
        required={true}
        lable={t("role")}
        requiredHint={`* ${t("required")}`}
        selectedItem={userData["role"]?.name}
        placeHolder={t("select_a_role")}
        errorMessage={error.get("role")}
        apiUrl={"roles/by/user"}
        mode="single"
        cacheData={false}
      />
    </div>
  );
}
