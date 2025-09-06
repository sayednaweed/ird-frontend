import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  placeholder: string;
  className?: string;
  paginationKey: string;
  emptyPlaceholder: string;
  rangePlaceholder: string;
  options: Option[];
  onChange?: (value: string) => void;
  updateCache: (data: any) => Promise<void>;
  getCache: () => Promise<any>;
}

const KEYS = {
  input: 0,
  default: 1,
};

const CustomSelect: React.FC<SelectProps> = ({
  placeholder,
  emptyPlaceholder,
  rangePlaceholder,
  options,
  onChange,
  updateCache,
  getCache,
  className,
  paginationKey,
}) => {
  const [selectData, setSelectData] = useState<{
    isOpen: boolean;
    showIcon: boolean;
    select: {
      key: string;
      value: string;
      option: number;
    };
  }>({
    isOpen: false,
    showIcon: false,
    select: {
      key: "",
      value: "",
      option: -1,
    },
  });
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSelect = (value: string) => {
    if (onChange) onChange(value);
    const item = {
      key: paginationKey,
      value: value,
      option: KEYS.default,
    };
    setSelectData({
      ...selectData,
      isOpen: false,
      select: item,
      showIcon: false,
    });
    updateCache(item);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (selectRef.current && !selectRef.current.contains(e.target as Node)) {
      setSelectData({ ...selectData, isOpen: false, showIcon: false });
    }
  };
  const load = async () => {
    try {
      const item = await getCache();
      if (item === undefined) {
        setSelectData({
          ...selectData,
          select: {
            key: paginationKey,
            value: "10",
            option: KEYS.default,
          },
        });
      } else setSelectData({ ...selectData, select: item });
    } catch (err) {
      console.error("Failed to load item:", err);
    }
  };
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    if (selectData.isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [selectData.isOpen]);

  useEffect(() => {
    if (selectData.isOpen && dropdownRef.current) {
      const updatePosition = () => {
        const dropdown = dropdownRef.current;
        const selectButton = selectRef.current;

        if (!dropdown || !selectButton) return;

        const dropdownRect = dropdown.getBoundingClientRect();
        const selectButtonRect = selectButton.getBoundingClientRect();
        const viewportWidth = window.innerWidth;

        // Default position is below the button
        let width = selectButtonRect.width / 2;
        let left = selectButtonRect.left;

        // Adjust if the dropdown overflows the viewport horizontally
        if (left - width <= 0) {
          dropdown.style.left = `${0}px`;
        } else if (left + dropdownRect.width >= viewportWidth) {
          dropdown.style.right = `${0}px`;
        } else {
          left += width;
          dropdown.style.right = `${-width}px`;
        }
      };

      updatePosition();

      window.addEventListener("resize", updatePosition);
      return () => window.removeEventListener("resize", updatePosition);
    }
  }, [selectData.isOpen]);

  const dialogPaddingFix =
    selectData.select.value && selectData.select.value.length == 1
      ? "px-3"
      : "px-2";
  return (
    <div className={cn("relative", className)} ref={selectRef}>
      <button
        onClick={() =>
          setSelectData({ ...selectData, isOpen: !selectData.isOpen })
        }
        className={`w-full rtl:text-sm-rtl py-2 border rounded-md flex items-center justify-between bg-card text-card-foreground ${dialogPaddingFix}`}
      >
        {selectData.select.value || placeholder}
        <ChevronDown
          className={`size-3 ml-2 transition-transform ${
            selectData.isOpen ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {selectData.isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-10 min-w-[120px] mt-2 bg-card border border-primary/15 rounded-md shadow-lg"
        >
          <div className="relative">
            <input
              ref={inputRef}
              onFocus={() => setSelectData({ ...selectData, showIcon: true })}
              type="number"
              placeholder={rangePlaceholder}
              defaultValue={
                selectData.select.option === KEYS.input
                  ? selectData.select.value
                  : ""
              }
              className={`bg-card  dark:bg-card-secondary text-tertiary rtl:text-lg-rtl w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-center text-sm px-4 py-2 border-b border-primary/15 rounded-t-md focus:outline-none`}
            />
            <Check
              onClick={() => {
                let value = inputRef.current!.value;
                let option = KEYS.input;
                if (value.trim() == "") {
                  value = "10";
                  option = KEYS.default;
                }
                if (onChange) onChange(value);
                const item = {
                  key: paginationKey,
                  value: value,
                  option: option,
                };
                updateCache(item);
                setSelectData({
                  ...selectData,
                  showIcon: false,
                  isOpen: false,
                  select: item,
                });
              }}
              className={`size-[16px] transition-[display] duration-300 bg-secondary text-primary rounded-sm p-[2px] absolute top-[10px] ltr:right-1 hover:opacity-80 cursor-pointer rtl:left-1 ${
                !selectData.showIcon ? "hidden" : ""
              }`}
            />
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {options.length === 0 ? (
              <li className="px-4 py-2 text-[14px] text-center text-primary/80">
                {emptyPlaceholder}
              </li>
            ) : (
              options.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option.value)}
                  className={`rtl:text-sm-rtl px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-primary/10 ${
                    selectData.select.value === option.value
                      ? "bg-primary/10"
                      : ""
                  }`}
                >
                  {option.label}
                  {selectData.select.value === option.value && (
                    <Check
                      className={`size-[12px] mt-1 font-bold transition-transform`}
                    />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
