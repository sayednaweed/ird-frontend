import { Command as CommandPrimitive, useCommandState } from "cmdk";
import { Eye, X } from "lucide-react";
import * as React from "react";
import { forwardRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { Option } from "@/lib/types";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import axiosClient from "@/lib/axois-client";
import useCacheDB from "@/lib/indexeddb/useCacheDB";
import { useTranslation } from "react-i18next";
import { useDebounce } from "@/hook/use-debounce";
import { toast } from "sonner";
import AnimatedItem from "@/hook/animated-item";

interface GroupOption {
  [key: string]: Option[];
}

interface MultipleSelectorProps {
  apiUrl?: string;
  shouldFetch?: boolean;
  params?: any;
  error?: Map<string, string>;
  showView?: boolean;
  onViewClick?: (option: Option) => void;
  onUnselect?: (option: Option) => void;
  popoverClassName?: string;
  value?: Option[];
  defaultOptions?: Option[];
  selectedOptions?: Option[];
  errorMessage?: string;
  requiredHint?: string;
  required: boolean;
  options?: Option[];
  placeholder?: string;
  label?: string;
  loadingIndicator?: React.ReactNode;
  emptyIndicator?: React.ReactNode;
  delay?: number;
  triggerSearchOnFocus?: boolean;
  onSearch?: (value: string) => Promise<Option[]>;
  onSearchSync?: (value: string) => Option[];
  onChange?: (options: Option[]) => void;
  maxSelected?: number;
  onMaxSelected?: (maxLimit: number) => void;
  hidePlaceholderWhenSelected?: boolean;
  disabled?: boolean;
  groupBy?: string;
  className?: string;
  badgeClassName?: string;
  selectFirstItem?: boolean;
  creatable?: boolean;
  cacheData?: boolean;
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>;
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    "value" | "placeholder" | "disabled"
  >;
  hideClearAllButton?: boolean;
}

export interface MultipleSelectorRef {
  selectedValue: Option[];
  input: HTMLInputElement;
  focus: () => void;
  reset: () => void;
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) {
    return {};
  }
  if (!groupBy) {
    return {
      "": options,
    };
  }

  const groupOption: GroupOption = {};
  options.forEach((option) => {
    const key = (option[groupBy] as string) || "";
    if (!groupOption[key]) {
      groupOption[key] = [];
    }
    groupOption[key].push(option);
  });
  return groupOption;
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const cloneOption = JSON.parse(JSON.stringify(groupOption)) as GroupOption;

  for (const [key, value] of Object.entries(cloneOption)) {
    cloneOption[key] = value.filter(
      (val) => !picked.find((p) => p.name === val.name)
    );
  }
  return cloneOption;
}

function isOptionsExist(groupOption: GroupOption, targetOption: Option[]) {
  for (const [, value] of Object.entries(groupOption)) {
    if (
      value.some((option) => targetOption.find((p) => p.name === option.name))
    ) {
      return true;
    }
  }
  return false;
}

const CommandEmpty = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof CommandPrimitive.Empty>
>(({ className, ...props }, forwardedRef) => {
  const render = useCommandState((state) => state.filtered.count === 0);

  if (!render) return null;

  return (
    <div
      ref={forwardedRef}
      className={cn("px-2 py-4 text-center text-sm", className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  );
});

CommandEmpty.displayName = "CommandEmpty";

const MultipleSelector = React.forwardRef<
  MultipleSelectorRef,
  MultipleSelectorProps
>(
  (
    {
      value,
      error,
      apiUrl,
      shouldFetch = true,
      showView = false,
      onViewClick,
      onUnselect,
      params,
      onChange,
      placeholder,
      defaultOptions: arrayDefaultOptions = [],
      selectedOptions,
      options: arrayOptions,
      delay,
      onSearch,
      onSearchSync,
      loadingIndicator,
      emptyIndicator,
      maxSelected = Number.MAX_SAFE_INTEGER,
      onMaxSelected,
      hidePlaceholderWhenSelected,
      disabled,
      groupBy,
      className,
      badgeClassName,
      selectFirstItem = true,
      creatable = false,
      triggerSearchOnFocus = false,
      commandProps,
      inputProps,
      hideClearAllButton = false,
      errorMessage,
      requiredHint,
      required,
      label,
      popoverClassName,
      cacheData = true,
    }: MultipleSelectorProps,
    ref: React.Ref<MultipleSelectorRef>
  ) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [open, setOpen] = React.useState(false);
    const [onScrollbar, setOnScrollbar] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [dropdownPosition, setDropdownPosition] = React.useState({
      top: 0,
      left: 0,
      width: 0,
    });
    const hasError = !!errorMessage;

    const [selected, setSelected] = React.useState<Option[]>(value || []);
    const { getApiCache, updateApiCache } = useCacheDB();
    const { i18n } = useTranslation();
    const lang = i18n.language;
    const updateDropdownPosition = useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    }, []);

    useEffect(() => {
      const handlePositionUpdate = () => {
        if (open) {
          updateDropdownPosition();
        }
      };

      window.addEventListener("scroll", handlePositionUpdate, true);
      window.addEventListener("resize", handlePositionUpdate);

      return () => {
        window.removeEventListener("scroll", handlePositionUpdate, true);
        window.removeEventListener("resize", handlePositionUpdate);
      };
    }, [open, updateDropdownPosition]);

    useEffect(() => {
      if (open) {
        updateDropdownPosition();
      }
    }, [selected, open, updateDropdownPosition]);

    const initialize = async () => {
      try {
        if (apiUrl && shouldFetch) {
          if (selectedOptions) {
            setSelected(selectedOptions);
          }
          setIsLoading(true);
          if (cacheData) {
            const content = (await getApiCache(apiUrl, lang)) as any;
            if (content) {
              const items = transToGroupOption(content, groupBy);
              setOptions(items);
              return;
            }
          }
          const response = await axiosClient.get(apiUrl, {
            params: params,
          });
          if (response.status == 200) {
            if (cacheData)
              updateApiCache({
                key: apiUrl,
                data: response.data,
                expireAt: 10,
                lang: lang,
              });
            const list: Option[] = response.data;
            const items = transToGroupOption(list, groupBy);
            setOptions(items);
          }
        } else {
          if (selectedOptions) {
            setSelected(selectedOptions);
            const items = transToGroupOption(arrayDefaultOptions, groupBy);
            setOptions(items);
          }
        }
      } catch (error: any) {
        console.log(error);
        toast.error(error.response?.data?.message);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      initialize();
    }, [selectedOptions]);

    const [options, setOptions] = React.useState<GroupOption>({ "": [] });
    const [inputValue, setInputValue] = React.useState("");
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500);

    React.useImperativeHandle(
      ref,
      () => ({
        selectedValue: [...selected],
        input: inputRef.current as HTMLInputElement,
        focus: () => inputRef?.current?.focus(),
        reset: () => setSelected([]),
      }),
      [selected]
    );

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        inputRef.current.blur();
      }
    };

    const handleUnselect = useCallback(
      (option: Option) => {
        const newOptions = selected.filter((s) => s.name !== option.name);
        setSelected(newOptions);
        onChange?.(newOptions);
        updateDropdownPosition();
        if (onUnselect) onUnselect(option);
      },
      [selected, onChange, updateDropdownPosition]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        const input = inputRef.current;
        if (input) {
          if (e.key === "Delete" || e.key === "Backspace") {
            if (input.value === "" && selected.length > 0) {
              const lastSelectOption = selected[selected.length - 1];
              if (!lastSelectOption.fixed) {
                handleUnselect(selected[selected.length - 1]);
              }
            }
          }
          if (e.key === "Escape") {
            input.blur();
          }
        }
      },
      [handleUnselect, selected]
    );

    useEffect(() => {
      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("touchend", handleClickOutside);
      } else {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      }
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchend", handleClickOutside);
      };
    }, [open]);

    useEffect(() => {
      if (value) {
        setSelected(value);
      }
    }, [value]);

    useEffect(() => {
      if (!arrayOptions || onSearch) {
        return;
      }
      const newOption = transToGroupOption(arrayOptions || [], groupBy);
      if (JSON.stringify(newOption) !== JSON.stringify(options)) {
        setOptions(newOption);
      }
    }, [arrayDefaultOptions, arrayOptions, groupBy, onSearch, options]);

    useEffect(() => {
      const doSearchSync = () => {
        const res = onSearchSync?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
      };

      const exec = async () => {
        if (!onSearchSync || !open) return;
        if (triggerSearchOnFocus) {
          doSearchSync();
        }
        if (debouncedSearchTerm) {
          doSearchSync();
        }
      };

      void exec();
    }, [
      debouncedSearchTerm,
      groupBy,
      open,
      triggerSearchOnFocus,
      onSearchSync,
    ]);

    useEffect(() => {
      const doSearch = async () => {
        setIsLoading(true);
        const res = await onSearch?.(debouncedSearchTerm);
        setOptions(transToGroupOption(res || [], groupBy));
        setIsLoading(false);
      };

      const exec = async () => {
        if (!onSearch || !open) return;
        if (triggerSearchOnFocus) {
          await doSearch();
        }
        if (debouncedSearchTerm) {
          await doSearch();
        }
      };

      void exec();
    }, [debouncedSearchTerm, groupBy, open, triggerSearchOnFocus, onSearch]);

    const CreatableItem = () => {
      if (!creatable) return undefined;
      if (
        isOptionsExist(options, [{ name: inputValue, label: inputValue }]) ||
        selected.find((s) => s.name === inputValue)
      ) {
        return undefined;
      }

      const Item = (
        <CommandItem
          value={inputValue}
          className="cursor-pointer"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onSelect={(value: string) => {
            if (selected.length >= maxSelected) {
              onMaxSelected?.(selected.length);
              return;
            }
            setInputValue("");
            const newOptions = [...selected, { name: value, label: value }];
            setSelected(newOptions);
            onChange?.(newOptions);
            updateDropdownPosition();
          }}
        >
          {`Create "${inputValue}"`}
        </CommandItem>
      );

      if (!onSearch && inputValue.length > 0) {
        return Item;
      }

      if (onSearch && debouncedSearchTerm.length > 0 && !isLoading) {
        return Item;
      }

      return undefined;
    };

    const EmptyItem = React.useCallback(() => {
      if (!emptyIndicator) return undefined;

      if (onSearch && !creatable && Object.keys(options).length === 0) {
        return (
          <CommandItem value="-" disabled>
            {emptyIndicator}
          </CommandItem>
        );
      }

      return <CommandEmpty>{emptyIndicator}</CommandEmpty>;
    }, [creatable, emptyIndicator, onSearch, options]);

    const selectables = React.useMemo<GroupOption>(
      () => removePickedOption(options, selected),
      [options, selected]
    );

    const commandFilter = React.useCallback(() => {
      if (commandProps?.filter) {
        return commandProps.filter;
      }
      if (creatable) {
        return (value: string, search: string) => {
          return value.toLowerCase().includes(search.toLowerCase()) ? 1 : -1;
        };
      }
      return undefined;
    }, [creatable, commandProps?.filter]);

    const handleFocus = useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        updateDropdownPosition();
        setOpen(true);
        triggerSearchOnFocus && onSearch?.(debouncedSearchTerm);
        inputProps?.onFocus?.(event);
      },
      [
        updateDropdownPosition,
        triggerSearchOnFocus,
        onSearch,
        debouncedSearchTerm,
        inputProps,
      ]
    );

    const subErrorExist = (opt: Option): boolean => {
      if (error && error.get(`${opt?.id}`) == "") {
        return true;
      }
      return false;
    };
    const errorComponent = React.useMemo(() => {
      return hasError ? (
        <AnimatedItem
          springProps={{
            from: { opacity: 0 },
            to: { opacity: 1 },
            config: { mass: 1, tension: 170, friction: 26 },
            reset: true,
          }}
          intersectionArgs={{ once: true, rootMargin: "-5% 0%" }}
        >
          <h1 className="text-red-400 text-start capitalize rtl:text-sm rtl:font-medium ltr:text-sm-ltr">
            {errorMessage}
          </h1>
        </AnimatedItem>
      ) : undefined;
    }, [hasError]);
    return (
      <Command
        {...commandProps}
        ref={containerRef}
        onKeyDown={(e) => {
          handleKeyDown(e);
          commandProps?.onKeyDown?.(e);
        }}
        className={cn(
          `h-auto overflow-visible bg-transparent relative ${
            required || label ? "mt-[20px]" : "mt-2"
          }`,
          commandProps?.className
        )}
        shouldFilter={
          commandProps?.shouldFilter !== undefined
            ? commandProps.shouldFilter
            : !onSearch
        }
        filter={commandFilter()}
      >
        {required && (
          <span className="text-red-600 rtl:text-[13px] ltr:text-[11px] ltr:right-[10px] rtl:left-[10px] -top-[17px] absolute font-semibold">
            {requiredHint}
          </span>
        )}
        <label
          htmlFor={label}
          className="rtl:text-lg-rtl ltr:text-xl-ltr rtl:right-[4px] ltr:left-[4px] ltr:-top-[22px] rtl:-top-[24px] absolute font-semibold"
        >
          {label}
        </label>
        <div
          className={cn(
            "relative min-h-[38px] rounded-lg border text-sm transition-shadow has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50",
            {
              "p-1": selected.length !== 0,
              "cursor-text": !disabled && selected.length !== 0,
            },
            !hideClearAllButton && "pe-9",
            hasError ? "border-red-400" : "border-input",
            className
          )}
          onClick={() => {
            if (disabled) return;
            inputRef?.current?.focus();
          }}
        >
          <div className="flex flex-wrap gap-1">
            {selected.map((option) => {
              return (
                <div
                  key={option.name}
                  className={cn(
                    `animate-fadeIn relative ltr:text-xl-ltr ${
                      subErrorExist(option) ? "bg-red-500" : "bg-primary"
                    } inline-flex h-fit cursor-default ltr:text-lg-ltr rtl:text-xl-rtl items- text-start rounded-md border border-solid rtl:ps-10 rtl:pe-2 ltr:pe-10 ltr:pl-2 rtl:pr-2 font-medium text-primary-foreground transition-all hover:bg-primary/70 disabled:cursor-not-allowed disabled:opacity-50 data-[fixed]:pe-2`,
                    badgeClassName
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                >
                  {option.name}
                  <button
                    className="absolute ltr:pb-1 -inset-y-px w-fit rtl:right-4 ltr:right-4 flex size-7 items-center justify-center rounded-e-lg border border-transparent p-0 text-primary-foreground ring-offset-background transition-colors hover:text-primary-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleUnselect(option);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={() => handleUnselect(option)}
                    aria-label="Remove"
                  >
                    <X size={14} strokeWidth={2} aria-hidden="true" />
                  </button>
                  {showView && (
                    <button
                      className="absolute ltr:pb-1 pr-[2px] -inset-y-px w-fit rtl:-start-px ltr:-end-px flex size-7 items-center justify-center rounded-e-lg border border-transparent p-0 text-primary-foreground ring-offset-background transition-colors hover:text-primary-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={() => {
                        if (onViewClick) onViewClick(option);
                      }}
                      aria-label="View"
                    >
                      <Eye
                        className="size-[14px]"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </div>
              );
            })}
            <CommandPrimitive.Input
              {...inputProps}
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={(value) => {
                setInputValue(value);
                inputProps?.onValueChange?.(value);
              }}
              onBlur={(event) => {
                if (!onScrollbar) {
                  setOpen(false);
                }
                inputProps?.onBlur?.(event);
              }}
              onFocus={handleFocus}
              placeholder={
                hidePlaceholderWhenSelected && selected.length !== 0
                  ? ""
                  : placeholder
              }
              className={cn(
                "flex-1 bg-transparent outline-none ltr:text-xl-ltr rtl:text-3xl-ltr placeholder:text-muted-foreground disabled:cursor-not-allowed",
                {
                  "w-full": hidePlaceholderWhenSelected,
                  "px-3 py-2": selected.length === 0,
                  "ml-1": selected.length !== 0,
                },
                inputProps?.className
              )}
            />
            <button
              type="button"
              onClick={() => {
                setSelected(selected.filter((s) => s.fixed));
                onChange?.(selected.filter((s) => s.fixed));
                updateDropdownPosition();
              }}
              className={cn(
                "absolute end-0 top-0 flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground/80 transition-shadow hover:text-foreground focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30",
                (hideClearAllButton ||
                  disabled ||
                  selected.length < 1 ||
                  selected.filter((s) => s.fixed).length === selected.length) &&
                  "hidden"
              )}
              aria-label="Clear all"
            >
              <X size={16} strokeWidth={2} aria-hidden="true" />
            </button>
          </div>
        </div>

        {open &&
          createPortal(
            <div
              className={cn(
                "fixed z-50 w-full min-w-[200px] overflow-hidden rounded-md border bg-popover shadow-md",
                "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
                popoverClassName
              )}
              style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${dropdownPosition.width}px`,
              }}
              data-state={open ? "open" : "closed"}
            >
              <CommandList
                className="max-h-[300px] overflow-auto"
                onMouseLeave={() => setOnScrollbar(false)}
                onMouseEnter={() => setOnScrollbar(true)}
                onMouseUp={() => inputRef?.current?.focus()}
              >
                {isLoading ? (
                  <>{loadingIndicator}</>
                ) : (
                  <>
                    {EmptyItem()}
                    {CreatableItem()}
                    {!selectFirstItem && (
                      <CommandItem value="-" className="hidden" />
                    )}
                    {Object.entries(selectables).map(([key, dropdowns]) => (
                      <CommandGroup
                        key={key}
                        heading={key}
                        className="h-full overflow-auto"
                      >
                        <>
                          {dropdowns.map((option) => {
                            return (
                              <CommandItem
                                key={option.name}
                                value={option.name}
                                disabled={option.disable}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                                onSelect={() => {
                                  if (selected.length >= maxSelected) {
                                    onMaxSelected?.(selected.length);
                                    return;
                                  }
                                  setInputValue("");
                                  const newOptions = [...selected, option];
                                  setSelected(newOptions);
                                  onChange?.(newOptions);
                                  updateDropdownPosition();
                                }}
                                className={cn(
                                  "cursor-pointer",
                                  option.disable &&
                                    "cursor-not-allowed opacity-50"
                                )}
                              >
                                {option.name}
                              </CommandItem>
                            );
                          })}
                        </>
                      </CommandGroup>
                    ))}
                  </>
                )}
              </CommandList>
            </div>,
            document.body
          )}
        {errorComponent}
      </Command>
    );
  }
);

MultipleSelector.displayName = "MultipleSelector";
export default MultipleSelector;
