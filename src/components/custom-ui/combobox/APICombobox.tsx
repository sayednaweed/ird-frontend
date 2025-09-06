import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { memo, useEffect, useState } from "react";
import NastranSpinner from "../spinner/NastranSpinner";
import { cn } from "@/lib/utils";
import axiosClient from "@/lib/axois-client";
import { useTranslation } from "react-i18next";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import { toast } from "sonner";
import AnimatedItem from "@/hook/animated-item";

export interface FetchApi {
  url: string;
  id: string;
}

export interface ComboboxItem {
  id: string;
  name: string;
  selected: boolean;
  value: string;
}

export type ComboboxMode = "single" | "multiple";

export interface IAPIComboboxProps {
  onSelect: (items: ComboboxItem[] | ComboboxItem) => void;
  selectedItem?: string;
  apiUrl?: string;
  apiSelected?: FetchApi;
  placeHolder?: string;
  readonly?: boolean;
  errorMessage?: string;
  mode: ComboboxMode;
  className?: string;
  params?: any;
  required?: boolean;
  requiredHint?: string;
  lable?: string;
  errorText: string;
  placeholderText: string;
  translate?: boolean;
  cacheData?: boolean;
  showIcon?: boolean;
  parentClassName?: string;
}

function APICombobox(props: IAPIComboboxProps) {
  const {
    onSelect,
    apiUrl,
    placeHolder,
    errorMessage,
    mode,
    selectedItem,
    readonly,
    className,
    required,
    params,
    requiredHint,
    errorText,
    lable,
    placeholderText,
    translate,
    showIcon = true,
    parentClassName,
    cacheData = true,
  } = props;
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Array<ComboboxItem>>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(selectedItem);
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { getApiCache, updateApiCache } = useCacheDB();

  const updateSelect = () => {
    if (selectedItem) {
      setItems((prevItems) =>
        prevItems.map((item) => {
          // Ensure comparison works correctly (trim whitespace, case-insensitive)
          return selectedItem.trim().toLowerCase() ===
            item.name.trim().toLowerCase()
            ? { ...item, selected: true }
            : { ...item, selected: false }; // Clear other selections
        })
      );
    }
  };
  const initialize = async () => {
    try {
      if (!readonly && apiUrl) {
        // 1. Check IndexedDB, if present set Items
        if (cacheData) {
          const content = (await getApiCache(apiUrl, lang)) as any;
          if (content) {
            setItems(content);
            updateSelect();
            setLoading(false);
            return;
          }
        }
        // 2. Fetch data
        const response = await axiosClient.get(apiUrl, {
          params: params,
        });
        // 3. Store in IndexedDB
        if (response.status == 200) {
          const data = response.data;
          if (cacheData)
            updateApiCache({
              key: apiUrl,
              data: data,
              expireAt: 10,
              lang: lang,
            });
          setItems(data);
          updateSelect(); // Update selection once items are fetched
        }
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    initialize();
  }, [readonly]);
  useEffect(() => {
    if (selectedItem) {
      setSelected(selectedItem);
      updateSelect(); // Call updateSelect to update the item list based on the selectedItem
    }
  }, [selectedItem]);

  const onSelectChange = (currentValue: any) => {
    if (mode == "multiple") {
      // setSelected({...selected,currentValue});
    } else {
      setSelected(currentValue);
    }
    const filteredItems = items.map((comboboxItem: ComboboxItem) => {
      const matched =
        comboboxItem.name.trim().toLowerCase() ==
        currentValue.trim().toLowerCase();

      if (mode === "single") {
        return matched
          ? { ...comboboxItem, selected: true }
          : { ...comboboxItem, selected: false };
      }
      return comboboxItem.name.trim().toLowerCase() ==
        currentValue.trim().toLowerCase() &&
        (comboboxItem.selected == undefined || comboboxItem.selected == false)
        ? { ...comboboxItem, selected: true }
        : comboboxItem.name.toLowerCase() == currentValue.toLowerCase() &&
          comboboxItem.selected == true
        ? { ...comboboxItem, selected: false }
        : comboboxItem;
    });
    setItems(filteredItems);
    const selectedItems = filteredItems.filter(
      (item: ComboboxItem) => item.selected === true
    );
    onSelect(mode === "single" ? selectedItems[0] : selectedItems);
    setOpen(false);
  };
  const hasError = !!errorMessage;

  return (
    <div className={cn(`self-start relative w-full`, parentClassName)}>
      <Popover
        open={open}
        onOpenChange={(selection: any) => {
          if (!readonly) setOpen(selection);
        }}
      >
        <PopoverTrigger asChild className="w-full">
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              ` w-full h-fit py-[14px] border-primary/25 rounded max-w-full bg-card shadow-none hover:bg-card hover:shadow-sm text-wrap hover text-start dark:bg-card-secondary rtl:text-lg-rtl ltr:text-xl-ltr relative justify-between ${
                hasError && "border-red-400 border"
              } ${required || lable ? "mt-[20px]" : "mt-2"} ${
                readonly && "cursor-not-allowed"
              }`,
              className
            )}
          >
            {!selected ? (
              <h1 className=" text-primary/90 rtl:text-xl-rtl ltr:text-lg-ltr">
                {placeHolder}
              </h1>
            ) : translate ? (
              t(selected)
            ) : (
              <h1 className="truncate">{selected}</h1>
            )}
            {showIcon && (
              <ChevronsUpDown className="h-4 w-4 ltr:ml-4 rtl:mr-4 shrink-0 opacity-50" />
            )}
            {required && (
              <span className="text-red-600 ltr:right-[10px] rtl:left-[10px] -top-[17px] absolute font-semibold rtl:text-[13px] ltr:text-[11px]">
                {requiredHint}
              </span>
            )}
            {lable && (
              <span className="rtl:text-lg-rtl ltr:text-lg-ltr ltr:left-[4px] rtl:right-[4px] ltr:-top-[26px] rtl:-top-[29px] absolute font-semibold">
                {lable}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-44 xxl:w-full sm:w-72 z-50 rtl:text-xl-rtl ltr:text-lg-ltr ">
          <Command>
            <CommandInput
              placeholder={placeholderText}
              className="h-9 mx-1 flex rtl:text-md-rtl ltr:text-lg-ltr"
            />
            <CommandEmpty>
              {loading ? (
                <NastranSpinner
                  labelclassname="text-[13px]"
                  className="size-[24px]"
                />
              ) : (
                errorText
              )}
            </CommandEmpty>
            <CommandList>
              <CommandGroup>
                {Array.isArray(items) &&
                  items.map((item: ComboboxItem, index: number) => (
                    <CommandItem
                      key={index}
                      value={item.name}
                      onSelect={onSelectChange}
                    >
                      {translate ? t(item.name) : item.name}
                      {item.selected && (
                        <Check className={"ltr:ml-auto rtl:mr-auto h-4 w-4"} />
                      )}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {hasError && (
        <AnimatedItem
          springProps={{
            from: {
              opacity: 0,
              transform: "translateY(-8px)",
            },
            config: {
              mass: 1,
              tension: 210,
              friction: 20,
            },
            to: {
              opacity: 1,
              transform: "translateY(0px)",
            },
          }}
          intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
        >
          <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-sm-ltr">
            {errorMessage}
          </h1>
        </AnimatedItem>
      )}
    </div>
  );
}

export default memo(APICombobox);
