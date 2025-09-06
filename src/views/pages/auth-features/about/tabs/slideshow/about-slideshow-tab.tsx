import axiosClient from "@/lib/axois-client";
import { useTranslation } from "react-i18next";
import CachedImage from "@/components/custom-ui/image/CachedImage";
import {
  BadgeCheck,
  BadgeX,
  ChevronsRight,
  CirclePlus,
  Repeat2,
  Search,
  Trash2,
} from "lucide-react";
import type { Slideshow, UserPermission } from "@/database/models";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PermissionEnum } from "@/database/model-enums";
import NastranModel from "@/components/custom-ui/model/NastranModel";
import PrimaryButton from "@/components/custom-ui/button/PrimaryButton";
import SlideshowDialog from "@/views/pages/auth-features/about/tabs/parts/slideshow-dialog";
import CustomInput from "@/components/custom-ui/input/CustomInput";
import Card from "@/components/custom-ui/resuseable/card";
import Shimmer from "@/components/custom-ui/shimmer/shimmer";

interface AboutSlideshowTabProps {
  permission: UserPermission;
}
export default function AboutSlideshowTab(props: AboutSlideshowTabProps) {
  const { permission } = props;
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [onEdit, setOnEdit] = useState<Slideshow | undefined>(undefined);
  const [slideshows, setSlideshows] = useState<{
    unFilterList: Slideshow[];
    filterList: Slideshow[];
  }>({
    unFilterList: [],
    filterList: [],
  });
  const initialize = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get("/slideshows");
      if (response.status == 200) {
        setSlideshows({
          unFilterList: response.data,
          filterList: response.data,
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initialize();
  }, []);
  const searchOnChange = (e: any) => {
    const { value } = e.target;
    // 1. Filter
    const filtered = slideshows.unFilterList.filter((item: Slideshow) =>
      item.title.toLowerCase().includes(value.toLowerCase())
    );
    setSlideshows({
      ...slideshows,
      filterList: filtered,
    });
  };
  const add = (slideshow: Slideshow) => {
    setSlideshows((prev) => ({
      unFilterList: [slideshow, ...prev.unFilterList],
      filterList: [slideshow, ...prev.filterList],
    }));
  };
  const edit = (slideshow: Slideshow) => {
    setSlideshows((prev) => {
      const updatedList = [...prev.unFilterList]; // clone the array
      const index = updatedList.findIndex((item) => item.id === slideshow.id);

      if (index !== -1) {
        updatedList[index] = slideshow; // replace at same position
      }

      return {
        unFilterList: updatedList,
        filterList: updatedList,
      };
    });

    setOnEdit(undefined);
  };

  const hasAdd = permission.sub.get(PermissionEnum.about.sub.slideshow)?.add;
  const hasDelete = permission.sub.get(
    PermissionEnum.about.sub.slideshow
  )?.delete;
  const hasEdit = permission.sub.get(PermissionEnum.about.sub.slideshow)?.edit;

  const loader = (
    <Card className="rounded-md m-0 p-0 space-y-4 shadow relative rtl:min-h-[400px] rtl:max-h-[400px] min-h-[380px] max-h-[380px] max-w-[90%] min-w-[90%] xxl:max-w-[50%] xxl:min-w-[50%] sm:min-w-[240px] sm:max-w-[240px]">
      <Shimmer className="p-0 h-[200px] sm:h-[200px]" />
      <Shimmer className="h-12 w-[90%] mx-auto" />
      <Shimmer className="h-20 w-[90%] mx-auto" />
    </Card>
  );
  return (
    <div className="flex flex-col items-center gap-y-12">
      <div className="flex gap-x-4 items-baseline">
        {hasAdd &&
          useMemo(
            () => (
              <NastranModel
                visible={onEdit ? true : false}
                size="lg"
                isDismissable={false}
                button={
                  <PrimaryButton>
                    <CirclePlus />
                  </PrimaryButton>
                }
                showDialog={async () => true}
              >
                <SlideshowDialog
                  slideshow={onEdit}
                  onComplete={(slideshow: Slideshow, isEdited: boolean) =>
                    isEdited ? edit(slideshow) : add(slideshow)
                  }
                  onCancel={() => setOnEdit(undefined)}
                />
              </NastranModel>
            ),
            [onEdit]
          )}

        <CustomInput
          size_="lg"
          placeholder={`${t("search")}...`}
          parentClassName="w-full md:min-w-90"
          type="text"
          className="bg-card"
          onChange={searchOnChange}
          startContent={
            <Search className="size-[18px] rtl:mr-[4px] text-primary pointer-events-none" />
          }
        />
        <Repeat2
          className="size-7 cursor-pointer self-center text-tertiary hover:scale-[1.1] transition-transform duration-300 ease-in-out"
          onClick={initialize}
        />
      </div>

      {loading ? (
        loader
      ) : (
        <div className="flex items-center justify-around gap-x-4 gap-y-12 flex-wrap">
          {slideshows.filterList.map((item: Slideshow) => (
            <Card
              key={item.id}
              className="m-0 p-0 rounded-md shadow relative rtl:min-h-[400px] rtl:max-h-[400px] min-h-[380px] max-h-[380px] gap-y-3 hover:-translate-y-1 transition-transform max-w-[90%] min-w-[90%] xxl:max-w-[50%] xxl:min-w-[50%] sm:min-w-[240px] sm:max-w-[240px] duration-300 ease-out"
            >
              <div className="p-0 h-[200px] sm:h-[200px]">
                <CachedImage
                  src={item.image}
                  shimmerClassName="min-w-full  shadow-lg h-full object-fill rounded-t-md"
                  className="min-w-full shadow-lg h-full object-fill rounded-t-md"
                  routeIdentifier="public"
                />
              </div>
              <div className="flex flex-col justify-start items-start gap-y-2 px-2 pb-6">
                <h2 className="font-bold rtl:text-lg-rtl max-w-full ltr:text-2xl-ltr line-clamp-2">
                  {item.title}
                </h2>
                <h1 className="rtl:text-lg-rtl ltr:text-xl-ltr max-w-full text-primary/95 line-clamp-3 px-2">
                  {item.description}
                </h1>
                {hasEdit && (
                  <div
                    onClick={() => setOnEdit(item)}
                    className="flex items-center select-none absolute bottom-4 ltr:pt-2 gap-x-2 px-1 hover:ltr:translate-x-3 hover:rtl:-translate-x-3 transition-transform ease-in-out cursor-pointer"
                  >
                    <h1 className="rtl:text-2xl-rtl max-w-full ltr:text-xl-ltr">
                      {t("view")}
                    </h1>
                    <ChevronsRight className="text-green-500 cursor-pointer rtl:rotate-180 hover:text-green-500/70 size-[18px] transition" />
                  </div>
                )}

                <div className="self-end flex items-center gap-x-2">
                  {item.visible ? (
                    <BadgeCheck className="size-5 text-green-400" />
                  ) : (
                    <BadgeX className="size-5 text-red-400" />
                  )}
                  {hasDelete && (
                    <Trash2 className="size-5 text-red-400 hover:text-red-400/80 cursor-pointer" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
