import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";

import { StatusEnum } from "@/database/model-enums";
import type { ProjectHeaderType } from "@/lib/types";

export interface ProjectEditHeaderProps {
  userData: ProjectHeaderType | undefined;
}

export default function ProjectEditHeader(props: ProjectEditHeaderProps) {
  const { userData } = props;

  return (
    <div className="self-center text-center pt-4">
      <h1 className="text-primary uppercase font-semibold line-clamp-2 text-wrap rtl:text-2xl-rtl ltr:text-4xl-ltr max-w-64 truncate">
        {userData?.name}
      </h1>
      <BooleanStatusButton
        className="mx-auto"
        getColor={function (): {
          style: string;
          value?: string;
        } {
          return StatusEnum.registered === userData?.status_id
            ? {
                style: "border-green-500/90",
                value: userData?.status,
              }
            : StatusEnum.expired == userData?.status_id
            ? {
                style: "border-red-500",
                value: userData?.status,
              }
            : StatusEnum.pending_for_schedule == userData?.status_id
            ? {
                style: "border-blue-500/90",
                value: userData?.status,
              }
            : {
                style: "border-orange-500",
                value: userData?.status,
              };
        }}
      />
    </div>
  );
}
