import CachedImage from "@/components/custom-ui/image/CachedImage";
import { MessageSquareText } from "lucide-react";
import type { IDonorInformation } from "@/views/pages/auth-features/donor/edit/donor-edit-page";

export interface EditHeaderProps {
  userData: IDonorInformation | undefined;
}

export default function DonorEditHeader(props: EditHeaderProps) {
  const { userData } = props;

  return (
    <div className="self-center text-center">
      <CachedImage
        src={userData?.donorInformation?.profile}
        alt="Avatar"
        shimmerClassName="size-[86px] !mb-4 !mt-6 mx-auto shadow-lg border border-primary/30 rounded-full"
        className="size-[86px] !mb-4 !mt-6 object-center object-cover mx-auto shadow-lg border border-tertiary rounded-full"
        routeIdentifier={"profile"}
      />

      <h1 className="text-primary uppercase font-semibold line-clamp-2 text-wrap rtl:text-2xl-rtl ltr:text-4xl-ltr max-w-64 truncate">
        {userData?.donorInformation?.username}
      </h1>
      <h1 className="leading-6 rtl:text-sm-rtl ltr:text-2xl-ltr max-w-64 truncate">
        {userData?.donorInformation?.email}
      </h1>
      <h1 dir="ltr" className="text-primary rtl:text-md-rtl ltr:text-xl-ltr">
        {userData?.donorInformation?.contact}
      </h1>
      <MessageSquareText className="size-[22px] cursor-pointer text-tertiary mx-auto mt-3" />
    </div>
  );
}
