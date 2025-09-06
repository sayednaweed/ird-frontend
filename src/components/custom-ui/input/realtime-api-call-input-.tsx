import CustomInput from "@/components/custom-ui/input/CustomInput";
import type { Applications } from "@/database/models";
import { useDebounce } from "@/hook/use-debounce";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export interface RealtimeApiCallInputProps {
  item: Applications;
  postCallback: (data: any) => Promise<boolean | undefined>;
  hasEdit: boolean | undefined;
  loading: boolean;
  type?: string;
  delay: number;
  regix: any;
  findReplace: (
    item: Applications,
    result: boolean | undefined,
    value: any
  ) => void;
}

export function RealtimeApiCallInput(props: RealtimeApiCallInputProps) {
  const {
    item,
    postCallback,
    hasEdit,
    findReplace,
    regix,
    loading,
    type,
    delay,
  } = props;
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(item.value);
  const [storing, setStoring] = useState(false);
  const debouncedValue = useDebounce(inputValue, delay);
  const saveData = async (debouncedValue: string) => {
    setStoring(true);
    const result = await postCallback({
      id: item.id,
      value: debouncedValue,
    });
    findReplace(item, result, inputValue);
    setStoring(false);
  };
  useEffect(() => {
    if (debouncedValue && !loading && debouncedValue != item.value) {
      saveData(debouncedValue);
    }
  }, [debouncedValue]);
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Allow only numbers and empty string
    if (inputValue === "" || regix.test(inputValue)) {
      if (hasEdit) {
        setInputValue(inputValue);
      }
    }
  };
  return (
    <div className=" bg-card p-2 rounded-sm border flex flex-col mt-2">
      <label className="font-semibold rtl:text-xl-rtl ltr:text-lg-ltr">
        {item.name}
      </label>
      <h1 className="text-start rtl:pr-1 rtl:text-lg-rtl ltr:text-lg-ltr pt-[2px] ltr:leading-3.5 rtl:leading-5 text-primary/80">
        {item.description}
      </h1>
      <CustomInput
        size_="sm"
        className={"rtl:text-end"}
        placeholder={t("enter")}
        value={inputValue}
        type="number"
        name="value"
        readOnly={storing}
        // errorMessage={error.get("contact")}
        onChange={(e) => handleInputChange(e)}
        endContent={
          storing ? (
            <Loader className="animate-spin text-primary/80" />
          ) : (
            <h1 className="rtl:text-lg-rtl ltr:text-lg-ltr border rounded-md p-1 -mt-[6px] bg-fourth/5">
              {type}
            </h1>
          )
        }
      />
    </div>
  );
}
