"use client";

import { CsButton } from "@/components/custom";
import { useAppDispatch } from "@/lib/hooks";
import { getPropertyAmenityDisplay } from "@/lib/property-amenities";
import {
  formatPropertyPrice,
  formatPropertyPricePerSqm,
} from "@/lib/property-price";
import { useGetMe } from "@/shared/auth/query";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { openConversation } from "@/store/chat.store";
import { isBefore, startOfDay } from "date-fns";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";
import { useLocale, useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateConversation } from "../../message/services/mutate";
import { useRequestSchedule } from "../../schedule/services/mutation";
import { useIncreaseView, useRecordInteraction } from "../services/mutate";
import { usePropertyDetail, useRecommendedProperties } from "../services/query";
import PropertyDetailGallery from "./PropertyDetailGallery";
import PropertyDetailOverview from "./PropertyDetailOverview";
import PropertyDetailSidebar from "./PropertyDetailSidebar";
import PropertyDetailSummary from "./PropertyDetailSummary";

const PropertyPhotoLightbox = dynamic(() => import("./PropertyPhotoLightbox"), {
  ssr: false,
});
const RecommendedPropertiesSection = dynamic(
  () => import("./RecommendedPropertiesSection"),
  {
    loading: () => (
      <section className="mt-20 border-t border-border pt-10">
        <div className="mb-8 h-8 w-56 animate-pulse rounded bg-muted" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`recommended-placeholder-${index + 1}`}
              className="h-[420px] animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </section>
    ),
  },
);

const TOUR_TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const SIMILAR_PROPERTIES_PAGE_SIZE = 3;

const PropertyDetail = () => {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const id = params?.id as string;

  const { data: property, isLoading } = usePropertyDetail(id);
  const { data: recommendedData, isLoading: isLoadingRecommended } =
    useRecommendedProperties(id);
  const { data: me } = useGetMe();

  const { mutate: increaseView } = useIncreaseView();
  const { mutateAsync: recordInteraction } = useRecordInteraction();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: requestBooking, isPending: isRequestingBooking } =
    useRequestSchedule();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [timeSlot, setTimeSlot] = useState("10:00");
  const [customerNote, setCustomerNote] = useState("");
  const [show3D, setShow3D] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [visibleRecommendedCount, setVisibleRecommendedCount] = useState(
    SIMILAR_PROPERTIES_PAGE_SIZE,
  );

  const t = useTranslations("PropertiesPage");
  const locale = useLocale();
  const today = startOfDay(new Date());
  const isClientLoggedIn = Boolean(me?.data?.userId);
  const prop = property?.data;

  const isPastTimeSlot = (selectedDate: Date | undefined, slot: string) => {
    if (!selectedDate) return false;

    const normalizedSelectedDate = startOfDay(selectedDate);
    if (normalizedSelectedDate.getTime() !== today.getTime()) {
      return false;
    }

    const [hours, minutes] = slot.split(":").map(Number);
    const slotDate = new Date(selectedDate);
    slotDate.setHours(hours, minutes, 0, 0);

    return slotDate <= new Date();
  };

  useEffect(() => {
    if (!id) {
      return;
    }

    const timer = window.setTimeout(() => {
      increaseView(id);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [id, increaseView]);

  useEffect(() => {
    if (!date || !isPastTimeSlot(date, timeSlot)) {
      return;
    }

    const nextAvailableTimeSlot = TOUR_TIME_SLOTS.find(
      (slot) => !isPastTimeSlot(date, slot),
    );

    setTimeSlot(nextAvailableTimeSlot || "");
  }, [date, timeSlot]);

  useEffect(() => {
    setVisibleRecommendedCount(SIMILAR_PROPERTIES_PAGE_SIZE);
  }, [id]);

  const displayPrice = useMemo(
    () =>
      prop
        ? formatPropertyPrice(
            prop.features.price,
            prop.features.priceUnit,
            prop.features.currency,
            locale,
          )
        : "",
    [locale, prop],
  );

  const pricePerSqm = useMemo(
    () =>
      prop
        ? formatPropertyPricePerSqm(
            prop.features.price,
            prop.features.priceUnit,
            prop.features.area,
            prop.features.currency,
            locale,
          )
        : "",
    [locale, prop],
  );

  const amenities = useMemo(
    () => (prop?.amenities || []).map(getPropertyAmenityDisplay),
    [prop?.amenities],
  );

  const galleryImages = useMemo(
    () =>
      prop?.media.images?.length
        ? prop.media.images.map((url) => ({ src: url, key: url }))
        : prop?.media.thumbnail
          ? [{ src: prop.media.thumbnail, key: "thumbnail" }]
          : [{ src: "/placeholder.jpg", key: "placeholder" }],
    [prop?.media.images, prop?.media.thumbnail],
  );

  const visibleRecommendedProperties = useMemo(
    () => recommendedData?.data?.slice(0, visibleRecommendedCount) || [],
    [recommendedData?.data, visibleRecommendedCount],
  );

  const canLoadMoreRecommended = useMemo(
    () => (recommendedData?.data?.length || 0) > visibleRecommendedCount,
    [recommendedData?.data?.length, visibleRecommendedCount],
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-emerald-600" />
      </div>
    );
  }

  if (!prop) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("detail.notFound")}
        </h2>
        <CsButton onClick={() => window.history.back()}>
          {t("detail.goBack")}
        </CsButton>
      </div>
    );
  }

  const handleSaveProperty = async (metadata?: Record<string, unknown>) => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: t("card.loginToSave"),
          description: t("card.loginToSaveDesc"),
        }),
      );
      return;
    }

    await recordInteraction({ id, type: "FAVORITE", metadata });
  };

  const handleContactAction = async (type: "call" | "message" | "zalo") => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: "Dang nhap de xem lien he",
          description:
            "Vui long dang nhap de xem thong tin so dien thoai cua nguoi ban hoac moi gioi.",
        }),
      );
      return;
    }

    const fullPhone = prop.userId.phone
      ? prop.userId.phone.replace(/^\+84/, "0")
      : "";

    if (!fullPhone) {
      toast.info("Nguoi ban chua cap nhat thong tin so dien thoai.");
      if (type !== "message") {
        return;
      }
    }

    if (type === "call") {
      window.location.href = `tel:${fullPhone}`;
      return;
    }

    if (type === "zalo") {
      window.open(`https://zalo.me/${fullPhone}`, "_blank");
      return;
    }

    try {
      const response = await createConversation([prop.userId._id]);
      if (response.data) {
        dispatch(openConversation(response.data));
      }
    } catch (error) {
      console.error("Chat conversation failed", error);
    }
  };

  const handleRequestBooking = async () => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: "Dang nhap de dat lich",
          description:
            "Vui long dang nhap de thuc hien dat lich hen xem bat dong san nay.",
        }),
      );
      return;
    }

    if (!date) {
      toast.error("Vui long chon ngay muon dat lich");
      return;
    }

    if (isBefore(startOfDay(date), today)) {
      toast.error("Chi co the dat lich tu hom nay tro di");
      return;
    }

    if (!timeSlot) {
      toast.error("Vui long chon gio muon dat lich");
      return;
    }

    if (isPastTimeSlot(date, timeSlot)) {
      toast.error("Gio hen phai lon hon thoi diem hien tai");
      return;
    }

    try {
      await requestBooking({
        listingId: id,
        customerName: me?.data?.userId?.fullName || "Khach hang",
        customerPhone: me?.data?.userId?.phone || "",
        customerEmail: me?.data?.userId?.email || "",
        date,
        startTime: timeSlot,
        customerNote,
      });
      void recordInteraction({ id, type: "SCHEDULE_REQUEST" });
      setIsBookingSuccess(true);
      toast.success("Gui yeu cau thanh cong!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendMessage = () => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: "Dang nhap de gui tin",
          description:
            "Vui long dang nhap de gui yeu cau den nguoi ban hoac moi gioi.",
        }),
      );
      return;
    }

    toast.info("Tinh nang gui yeu cau dang duoc phat trien.");
  };

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 pb-8 pt-6 md:px-20">
        <button
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
          {t("detail.goBack")}
        </button>

        <PropertyDetailGallery
          property={prop}
          onOpenViewer={(index) => {
            setViewerIndex(index);
            setViewerVisible(true);
          }}
        />
      </div>

      <main className="container mx-auto px-4 md:px-20">
        <div className="flex flex-col gap-12 lg:flex-row">
          <div className="w-full space-y-10 lg:w-[65%]">
            <PropertyDetailSummary property={prop} />
            <PropertyDetailOverview
              property={prop}
              amenities={amenities}
              show3D={show3D}
              onShow3D={() => setShow3D(true)}
            />
          </div>

          <PropertyDetailSidebar
            property={prop}
            displayPrice={displayPrice}
            pricePerSqm={pricePerSqm}
            isClientLoggedIn={isClientLoggedIn}
            isBookingSuccess={isBookingSuccess}
            isRequestingBooking={isRequestingBooking}
            date={date}
            timeSlot={timeSlot}
            customerNote={customerNote}
            today={today}
            tourTimeSlots={TOUR_TIME_SLOTS}
            onDateChange={setDate}
            onTimeSlotChange={setTimeSlot}
            onCustomerNoteChange={setCustomerNote}
            onContactAction={handleContactAction}
            onRequestBooking={handleRequestBooking}
            onSendMessage={handleSendMessage}
            onSaveProperty={handleSaveProperty}
            onResetBookingSuccess={() => setIsBookingSuccess(false)}
            isPastTimeSlot={isPastTimeSlot}
          />
        </div>

        <RecommendedPropertiesSection
          properties={visibleRecommendedProperties}
          isLoading={isLoadingRecommended}
          canLoadMore={canLoadMoreRecommended}
          onLoadMore={() =>
            setVisibleRecommendedCount(
              (currentCount) => currentCount + SIMILAR_PROPERTIES_PAGE_SIZE,
            )
          }
        />
      </main>

      <PropertyPhotoLightbox
        images={galleryImages}
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
      />
    </div>
  );
};

export default PropertyDetail;
