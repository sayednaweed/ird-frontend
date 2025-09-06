import BooleanStatusButton from "@/components/custom-ui/button/BooleanStatusButton";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import { StatusEnum } from "@/database/model-enums";
import type { UserInformation } from "@/lib/types";

export interface UserEditHeaderProps {
  userData: UserInformation | undefined;
}

export default function UserEditHeader(props: UserEditHeaderProps) {
  const { userData } = props;

  return (
    <div className="self-center text-center">
      <CachedImage
        src={userData?.profile}
        alt="Avatar"
        shimmerClassName="size-[86px] !mb-4 mt-6 mx-auto shadow-lg border border-primary/30 rounded-full"
        className="size-[86px] !mb-4 mt-6 object-center object-cover mx-auto shadow-lg border border-primary/50 rounded-full"
        routeIdentifier={"private"}
      />

      <h1 className="text-primary font-semibold rtl:text-2xl-rtl ltr:text-4xl-ltr line-clamp-2 max-w-[80%] mx-auto">
        {userData?.username}
      </h1>
      <h1 className="leading-6 rtl:text-sm-rtl ltr:text-2xl-ltr">
        {userData?.email}
      </h1>
      <h1 dir="ltr" className="text-primary rtl:text-md-rtl ltr:text-xl-ltr">
        {userData?.contact}
      </h1>
      {userData && (
        <BooleanStatusButton
          className="mt-2 mx-auto"
          getColor={function (): {
            style: string;
            value?: string;
          } {
            return StatusEnum.active === userData?.status_id
              ? {
                  style: "border-green-500/90",
                  value: userData.status,
                }
              : {
                  style: "border-red-500",
                  value: userData?.status,
                };
          }}
        />
      )}
    </div>
  );
}
