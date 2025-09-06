import CachedImage from "@/components/custom-ui/image/CachedImage";
import { MessageSquareText } from "lucide-react";
import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";

import { StatusEnum } from "@/database/model-enums";
import type { IOrganizationInformation } from "@/views/pages/auth-features/organization/edit/organization-edit-page";

export interface EditHeaderProps {
  userData: IOrganizationInformation | undefined;
}

export default function EditHeader(props: EditHeaderProps) {
  const { userData } = props;

  return (
    <div className="self-center text-center">
      <CachedImage
        src={userData?.organizationInformation?.profile}
        alt="Avatar"
        shimmerClassName="size-[86px] !mt-6 mx-auto shadow-lg border border-primary/30 rounded-full"
        className="size-[86px] !mt-6 object-center object-cover mx-auto shadow-lg border border-tertiary rounded-full"
        routeIdentifier={"profile"}
      />

      <BooleanStatusButton
        className="mx-auto mt-4 !py-1 ltr:text-xl-ltr"
        getColor={function (): {
          style: string;
          value?: string;
        } {
          return StatusEnum.registered ===
            userData?.organizationInformation.status_id
            ? {
                style: "border-green-500/90 text-green-500",
                value: userData?.organizationInformation.status,
              }
            : StatusEnum.block == userData?.organizationInformation.status_id
            ? {
                style: "border-red-500",
                value: userData?.organizationInformation.status,
              }
            : StatusEnum.registration_incomplete ==
              userData?.organizationInformation.status_id
            ? {
                style: "border-blue-500/90",
                value: userData?.organizationInformation.status,
              }
            : {
                style: "border-orange-500",
                value: userData?.organizationInformation.status,
              };
        }}
      />
      <h1 className="text-primary uppercase font-semibold line-clamp-2 text-wrap rtl:text-2xl-rtl ltr:text-4xl-ltr max-w-64 truncate">
        {userData?.organizationInformation?.username}
      </h1>
      <h1 className="leading-6 rtl:text-sm-rtl ltr:text-2xl-ltr max-w-64 truncate">
        {userData?.organizationInformation?.email}
      </h1>
      <h1 dir="ltr" className="text-primary rtl:text-md-rtl ltr:text-xl-ltr">
        {userData?.organizationInformation?.contact}
      </h1>
      <MessageSquareText className="size-[22px] cursor-pointer text-tertiary mx-auto mt-3" />
    </div>
  );
}
