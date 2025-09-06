import React, { type ReactElement } from "react";
import type { ReactNode } from "react";
import SingleTab from "./parts/SingleTab";
import OptionalTab from "./parts/OptionalTab";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface SingleTabTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  children:
    | ReactElement<typeof SingleTab | typeof OptionalTab>
    | ReactElement<typeof SingleTab | typeof OptionalTab>[];
  userData: any;
  errorData?: Map<string, string>;
  onTabChanged: (
    key: string,
    data: string,
    isOptional: boolean,
    optionalLang: string
  ) => void;
  onChanged: (value: string, name: string) => void;
  highlightColor: string;
  placeholder?: string;
  tabsClassName?: string;
  parentClassName?: string;
  title?: string;
  name: string;
}

const SingleTabTextarea = React.forwardRef<
  HTMLTextAreaElement,
  SingleTabTextareaProps
>((props, ref: any) => {
  const {
    className,
    name,
    tabsClassName,
    parentClassName,
    children,
    userData,
    errorData,
    onTabChanged,
    onChanged,
    highlightColor,
    placeholder,
    title,
    ...rest
  } = props;
  const selectionName = `${name}_selections`;

  const tabChanged = (
    tabName: string,
    isOptional: boolean = false,
    optionalLang: string
  ) => onTabChanged(selectionName, tabName, isOptional, optionalLang);
  const inputOnchange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value, name } = e.target;
    onChanged(value, name);
  };
  const processTabs = (children: ReactNode) => {
    let selectedKey = userData[selectionName];
    const elements = React.Children.map(children, (child, mainIndex) => {
      if (React.isValidElement(child)) {
        // cast child here to ReactElement<any>
        const element = child as React.ReactElement<any>;
        const levelOneChildren = element.props.children;

        if (element.type === SingleTab) {
          const selectItemText = generateUniqueName(name, levelOneChildren);
          if (mainIndex === 0 && !selectedKey) {
            selectedKey = selectItemText;
          }
          let classNameOne = element.props.className;
          let newColor = "";
          if (errorData && errorData.get(selectItemText)) {
            newColor += " bg-red-500 ";
          } else {
            newColor =
              selectedKey === selectItemText
                ? ` ${highlightColor}`
                : mainIndex === 0 && !selectedKey
                ? ` ${highlightColor}`
                : "";
          }

          if (classNameOne) {
            classNameOne += newColor;
          } else {
            classNameOne = newColor;
          }

          return React.cloneElement(element, {
            className: classNameOne,
            onClick: () => tabChanged(selectItemText, false, "farsi"),
          });
        } else if (element.type === OptionalTab) {
          if (Array.isArray(levelOneChildren)) {
            if (mainIndex == 0 && !selectedKey) {
              selectedKey = generateUniqueName(
                name,
                levelOneChildren[0].props.children
              );
            }
            return (
              <div className="flex gap-1" key={`optional-tab-${mainIndex}`}>
                {React.Children.map(levelOneChildren, (childInner, index) => {
                  if (!React.isValidElement(childInner)) return null;
                  // cast childInner here to ReactElement<any>
                  const innerElement = childInner as React.ReactElement<any>;
                  const levelTwoChildren = innerElement.props.children;
                  const selectItemTextInner = generateUniqueName(
                    name,
                    levelTwoChildren
                  );

                  let classNameOne = innerElement.props.className;
                  let newColor = "";
                  if (errorData && errorData.get(selectItemTextInner)) {
                    newColor += " bg-red-500 ";
                  } else {
                    newColor =
                      selectedKey === selectItemTextInner
                        ? ` ${highlightColor}`
                        : mainIndex === 0 && !selectedKey
                        ? ` ${highlightColor}`
                        : "";
                  }
                  if (classNameOne) {
                    classNameOne += newColor;
                  } else {
                    classNameOne = newColor;
                  }
                  return (
                    <React.Fragment key={`optional-tab-inner-${index}`}>
                      {React.cloneElement(innerElement, {
                        className: classNameOne,
                        onClick: () =>
                          tabChanged(
                            selectItemTextInner,
                            true,
                            levelTwoChildren
                          ),
                      })}
                      {index % 2 === 0 && (
                        <div className="font-semibold text-[18px] text-primary/80">
                          │
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            );
          } else if (mainIndex == 0 && !selectedKey) {
            selectedKey = generateUniqueName(
              name,
              levelOneChildren.props.children
            );
          }
        }
      }
      return null;
    });
    const selectTab = userData[selectedKey];
    return { elements, selectTab, selectedKey };
  };
  const { elements, selectTab, selectedKey } = processTabs(children);
  return (
    <div className={cn("flex flex-col", parentClassName)}>
      {/* Title */}
      <h1 className="ltr:text-2xl-ltr rtl:text-2xl-rtl text-start font-semibold">
        {title}
      </h1>
      {/* Header */}
      <div className={cn("flex gap-x-4", tabsClassName)}>{elements}</div>
      {/* Body */}
      <Textarea
        {...rest}
        className={cn(
          "mt-2 focus-visible:ring-0 focus-visible:border-primary/30 focus-visible:ring-offset-0",
          className
        )}
        ref={ref}
        name={selectedKey}
        key={selectedKey}
        placeholder={placeholder}
        onChange={inputOnchange}
        defaultValue={selectTab}
      />
    </div>
  );
});

export default SingleTabTextarea;

const generateUniqueName = (name: string, transName: string) =>
  `${name}_${transName}`;
