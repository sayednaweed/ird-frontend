import CustomCheckbox from "@/components/custom-ui/checkbox/CustomCheckbox";
import type { Applications } from "@/database/models";

import { useState } from "react";

export interface RealtimeApiCallCheckboxProps {
  item: Applications;
  postCallback: (data: any) => Promise<boolean | undefined>;
  hasEdit: boolean | undefined;
  loading: boolean;
  findReplace: (
    item: Applications,
    result: boolean | undefined,
    value: any
  ) => void;
}

export default function RealtimeApiCallCheckbox(
  props: RealtimeApiCallCheckboxProps
) {
  const { item, postCallback, hasEdit, findReplace, loading } = props;
  const [value, setValue] = useState<boolean>(item.value == "true");
  const [storing, setStoring] = useState(false);

  const onChangeBool = async (value: boolean) => {
    if (hasEdit && !storing) {
      setValue(value);
      setStoring(true);
      const result = await postCallback({
        id: item.id,
        value: value,
      });
      findReplace(item, result, value);
      setStoring(false);
    }
  };
  return (
    <CustomCheckbox
      key={item.id}
      loading={loading || storing}
      checked={value}
      onCheckedChange={onChangeBool}
      description={item.description}
      parentClassName="rounded-md py-[12px] gap-x-1 bg-card border px-[10px]"
      text={item.name}
    />
  );
}
