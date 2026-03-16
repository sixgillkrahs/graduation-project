"use client";

import type { AxiosError } from "axios";
import { format, isBefore, startOfDay } from "date-fns";
import { AlertCircle, ArrowLeft, House } from "lucide-react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import StateSurface from "@/components/ui/state-surface";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { getPropertyAmenityDisplay } from "@/lib/property-amenities";
import {
  formatPropertyPrice,
  formatPropertyPricePerSqm,
} from "@/lib/property-price";
import { useGetMe } from "@/shared/auth/query";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { openConversation } from "@/store/chat.store";
import { useCreateLead } from "../../leads/services/mutate";
import {
  LeadContactChannel,
  LeadContactTime,
  LeadIntent,
  LeadSource,
} from "../../leads/services/type";
import { useCreateConversation } from "../../message/services/mutate";
import { useRequestSchedule } from "../../schedule/services/mutation";
import { useGetScheduleAvailability } from "../../schedule/services/query";
import { mapPropertyToCompareItem } from "../compare/compare.utils";
import RecentlyViewedSection from "../components/RecentlyViewedSection";
import { mapPropertyToRecentlyViewed } from "../recently-viewed/recently-viewed.utils";
import { useRecentlyViewedProperties } from "../recently-viewed/useRecentlyViewedProperties";
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

  const {
    data: property,
    isLoading,
    isError,
    error,
    refetch,
  } = usePropertyDetail(id);
  const {
    data: recommendedData,
    isLoading: isLoadingRecommended,
    isError: isRecommendedError,
    refetch: refetchRecommended,
  } = useRecommendedProperties(id);
  const { data: me } = useGetMe();

  const { mutate: increaseView } = useIncreaseView();
  const { mutateAsync: recordInteraction } = useRecordInteraction();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: createLead, isPending: isSubmittingLead } =
    useCreateLead();
  const { mutateAsync: requestBooking, isPending: isRequestingBooking } =
    useRequestSchedule();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState("10:00");
  const [customerNote, setCustomerNote] = useState("");
  const [show3D, setShow3D] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isBookingSuccess, setIsBookingSuccess] = useState(false);
  const [isInquirySuccess, setIsInquirySuccess] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("tour");
  const [visibleRecommendedCount, setVisibleRecommendedCount] = useState(
    SIMILAR_PROPERTIES_PAGE_SIZE,
  );
  const [inquiryForm, setInquiryForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    intent: LeadIntent.BUY_TO_LIVE,
    interestTopics: ["PRICE"],
    budgetRange: "",
    preferredContactTime: LeadContactTime.ASAP,
    preferredContactChannel: LeadContactChannel.PHONE,
    message: "",
    website: "",
  });

  const t = useTranslations("PropertiesPage");
  const locale = useLocale();
  const [today, setToday] = useState<Date | null>(null);
  const isClientLoggedIn = Boolean(me?.data?.userId);
  const prop = property?.data;
  const {
    items: recentlyViewedItems,
    hydrated: recentlyViewedHydrated,
    trackProperty,
  } = useRecentlyViewedProperties(id);

  const isPastTimeSlot = useCallback(
    (selectedDate: Date | undefined, slot: string) => {
      if (!selectedDate || !today) return false;

      const normalizedSelectedDate = startOfDay(selectedDate);
      if (normalizedSelectedDate.getTime() !== today.getTime()) {
        return false;
      }

      const [hours, minutes] = slot.split(":").map(Number);
      const slotDate = new Date(selectedDate);
      slotDate.setHours(hours, minutes, 0, 0);

      return slotDate <= new Date();
    },
    [today],
  );

  useEffect(() => {
    const currentDay = startOfDay(new Date());
    setToday(currentDay);
    setDate((prev) => prev || currentDay);
  }, []);

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
    if (!id) {
      return;
    }

    setVisibleRecommendedCount(SIMILAR_PROPERTIES_PAGE_SIZE);
  }, [id]);

  useEffect(() => {
    if (!me?.data?.userId) {
      return;
    }

    setInquiryForm((prev) => ({
      ...prev,
      customerName: prev.customerName || me.data.userId.fullName || "",
      customerPhone: prev.customerPhone || me.data.userId.phone || "",
      customerEmail: prev.customerEmail || me.data.userId.email || "",
    }));
  }, [me?.data?.userId]);

  useEffect(() => {
    if (!prop || !recentlyViewedHydrated) {
      return;
    }

    trackProperty(mapPropertyToRecentlyViewed(prop));
  }, [prop, recentlyViewedHydrated, trackProperty]);

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
  const availabilityDate = useMemo(
    () => (date ? format(date, "yyyy-MM-dd") : ""),
    [date],
  );
  const {
    data: availabilityResponse,
    isLoading: isLoadingAvailability,
    refetch: refetchAvailability,
  } = useGetScheduleAvailability(
    id && availabilityDate
      ? { listingId: id, date: availabilityDate }
      : undefined,
  );
  const availability = availabilityResponse?.data;
  const availabilitySlotLookup = useMemo(
    () => new Map((availability?.slots || []).map((slot) => [slot.slot, slot])),
    [availability?.slots],
  );
  const availabilitySlots = useMemo(
    () =>
      TOUR_TIME_SLOTS.map((slot) => {
        const availabilitySlot = availabilitySlotLookup.get(slot);

        return {
          slot,
          endTime: availabilitySlot?.endTime || "",
          isAvailableFromApi: availabilitySlot?.isAvailable ?? true,
          conflictCount: availabilitySlot?.conflictCount || 0,
        };
      }),
    [availabilitySlotLookup],
  );
  const availableSlotCount = useMemo(
    () =>
      availabilitySlots.filter(
        ({ slot, isAvailableFromApi }) =>
          isAvailableFromApi && !isPastTimeSlot(date, slot),
      ).length,
    [availabilitySlots, date, isPastTimeSlot],
  );

  useEffect(() => {
    if (!today || !date) {
      return;
    }

    const nextAvailableTimeSlot =
      availabilitySlots.find(
        ({ slot, isAvailableFromApi }) =>
          isAvailableFromApi && !isPastTimeSlot(date, slot),
      )?.slot || "";
    const selectedSlot = availabilitySlots.find(
      (slot) => slot.slot === timeSlot,
    );
    const isCurrentSlotAvailable =
      Boolean(timeSlot) &&
      Boolean(selectedSlot?.isAvailableFromApi) &&
      !isPastTimeSlot(date, timeSlot);

    if (isCurrentSlotAvailable || timeSlot === nextAvailableTimeSlot) {
      return;
    }

    setTimeSlot(nextAvailableTimeSlot);
  }, [availabilitySlots, date, isPastTimeSlot, timeSlot, today]);

  const propertyStatusCode = (error as AxiosError | null)?.response?.status;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-8">
        <div className="container mx-auto px-4 md:px-20">
          <StateSurface
            tone="brand"
            eyebrow="Property"
            icon={<ArrowLeft className="h-6 w-6 animate-pulse" />}
            title="Loading property details"
            description="Preparing media, pricing, amenities, and contact options for this listing."
          />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-8">
        <div className="container mx-auto px-4 md:px-20">
          <StateSurface
            tone={propertyStatusCode === 404 ? "brand" : "danger"}
            eyebrow="Property"
            icon={
              propertyStatusCode === 404 ? (
                <House className="h-6 w-6" />
              ) : (
                <AlertCircle className="h-6 w-6" />
              )
            }
            title={
              propertyStatusCode === 404
                ? t("detail.notFound")
                : "Could not load this property"
            }
            description={
              propertyStatusCode === 404
                ? "This listing may have been removed, unpublished, or its link is no longer valid."
                : "The property detail service is temporarily unavailable. Try again or return to the listing feed."
            }
            primaryAction={{
              label:
                propertyStatusCode === 404 ? "Browse properties" : "Try again",
              onClick: () => {
                if (propertyStatusCode === 404) {
                  router.push(ROUTES.PROPERTIES);
                  return;
                }

                void refetch();
              },
            }}
            secondaryAction={{
              label: t("detail.goBack"),
              onClick: () => router.back(),
              variant: "outline",
            }}
          />
        </div>
      </div>
    );
  }

  if (!prop) {
    return (
      <div className="min-h-screen bg-background pb-20 pt-8">
        <div className="container mx-auto px-4 md:px-20">
          <StateSurface
            tone="brand"
            eyebrow="Property"
            icon={<House className="h-6 w-6" />}
            title={t("detail.notFound")}
            description="This listing is no longer available. Return to the property feed to keep browsing."
            primaryAction={{
              label: "Browse properties",
              onClick: () => router.push(ROUTES.PROPERTIES),
            }}
            secondaryAction={{
              label: t("detail.goBack"),
              onClick: () => router.back(),
              variant: "outline",
            }}
          />
        </div>
      </div>
    );
  }

  const compareItem = mapPropertyToCompareItem(prop);

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

  const redirectToBuyerProfile = (message: string) => {
    toast.info(message);
    router.push(ROUTES.PROFILE_EDIT);
  };

  const getBuyerProfileSnapshot = () => {
    const customerName = me?.data?.userId?.fullName?.trim() || "";
    const customerPhone = me?.data?.userId?.phone?.trim() || "";
    const customerEmail = me?.data?.userId?.email?.trim() || "";

    return {
      customerName,
      customerPhone,
      customerEmail,
      isComplete: Boolean(customerName && customerPhone && customerEmail),
    };
  };

  const requireTrackedContactProfile = (message: string) => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: "Dang nhap de xem lien he",
          description:
            "Vui long dang nhap de xem thong tin so dien thoai cua nguoi ban hoac moi gioi.",
        }),
      );
      return null;
    }

    const { customerName, customerPhone, customerEmail, isComplete } =
      getBuyerProfileSnapshot();

    if (!isComplete) {
      setActiveSidebarTab("request");
      redirectToBuyerProfile(message);
      return null;
    }

    return {
      customerName,
      customerPhone,
      customerEmail,
    };
  };

  const createTrackedContactLead = async (
    source: LeadSource,
    preferredContactChannel: LeadContactChannel,
    message: string,
  ) => {
    if (!prop) {
      return false;
    }

    const contactProfile = requireTrackedContactProfile(
      "Complete your buyer profile with display name, phone number, and email before contacting the agent.",
    );
    if (!contactProfile) {
      return false;
    }

    try {
      await createLead({
        listingId: id,
        customerName: contactProfile.customerName,
        customerPhone: contactProfile.customerPhone,
        customerEmail: contactProfile.customerEmail,
        intent: LeadIntent.CONSULTATION,
        interestTopics: ["VIEWING"],
        budgetRange: "FLEXIBLE",
        preferredContactTime: LeadContactTime.ASAP,
        preferredContactChannel,
        source,
        message,
        website: "",
      });
      return true;
    } catch (error) {
      console.error("Failed to track contact action", error);
      toast.error("Khong the ghi nhan yeu cau lien he luc nay.");
      return false;
    }
  };

  const handleContactAction = async (type: "call" | "chat" | "request") => {
    if (type === "request") {
      setActiveSidebarTab("request");
      return;
    }

    const fullPhone = prop.userId.phone
      ? prop.userId.phone.replace(/^\+84/, "0")
      : "";

    if (!fullPhone) {
      toast.info("Nguoi ban chua cap nhat thong tin so dien thoai.");
      if (type !== "chat") {
        return;
      }
    }

    if (type === "call") {
      const tracked = await createTrackedContactLead(
        LeadSource.PROPERTY_CALL,
        LeadContactChannel.PHONE,
        `Customer tapped Call on property detail for ${prop.title}.`,
      );
      if (!tracked) {
        return;
      }
      window.location.href = `tel:${fullPhone}`;
      return;
    }

    const tracked = await createTrackedContactLead(
      LeadSource.PROPERTY_CHAT,
      LeadContactChannel.CHAT,
      `Customer started chat on property detail for ${prop.title}.`,
    );
    if (!tracked) {
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

    if (!date || !today) {
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

    const selectedAvailability = availabilitySlotLookup.get(timeSlot);
    if (selectedAvailability && !selectedAvailability.isAvailable) {
      toast.error("Khung gio nay vua duoc dat. Vui long chon khung gio khac");
      return;
    }

    const buyerProfile = requireTrackedContactProfile(
      "Complete your buyer profile with display name, phone number, and email before booking an appointment.",
    );
    if (!buyerProfile) {
      return;
    }

    try {
      await requestBooking({
        listingId: id,
        customerName: buyerProfile.customerName,
        customerPhone: buyerProfile.customerPhone,
        customerEmail: buyerProfile.customerEmail,
        date,
        startTime: timeSlot,
        customerNote,
      });
      void refetchAvailability();
      void recordInteraction({ id, type: "SCHEDULE_REQUEST" });
      setIsBookingSuccess(true);
      toast.success("Gui yeu cau thanh cong!");
    } catch (error) {
      console.error(error);
    }
  };

  const handleInquiryFieldChange = (
    field: keyof typeof inquiryForm,
    value: string,
  ) => {
    setInquiryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleInquiryTopicToggle = (topic: string) => {
    setInquiryForm((prev) => {
      const exists = prev.interestTopics.includes(topic);
      if (exists && prev.interestTopics.length === 1) {
        return prev;
      }

      return {
        ...prev,
        interestTopics: exists
          ? prev.interestTopics.filter((item) => item !== topic)
          : [...prev.interestTopics, topic],
      };
    });
  };

  const handleSendMessage = async () => {
    if (!prop) {
      return;
    }

    const buyerProfile = isClientLoggedIn
      ? requireTrackedContactProfile(
          "Complete your buyer profile with display name, phone number, and email before sending an inquiry.",
        )
      : null;

    if (isClientLoggedIn && !buyerProfile) {
      return;
    }

    const customerName =
      buyerProfile?.customerName || inquiryForm.customerName.trim();
    const customerPhone =
      buyerProfile?.customerPhone || inquiryForm.customerPhone.trim();
    const customerEmail =
      buyerProfile?.customerEmail || inquiryForm.customerEmail.trim();

    if (!customerName) {
      toast.error("Vui long nhap ho ten.");
      return;
    }

    if (!customerPhone) {
      toast.error("Vui long nhap so dien thoai.");
      return;
    }

    if (!inquiryForm.budgetRange.trim()) {
      toast.error("Vui long chon ngan sach.");
      return;
    }

    try {
      await createLead({
        listingId: id,
        customerName,
        customerPhone,
        customerEmail,
        intent: inquiryForm.intent,
        interestTopics: inquiryForm.interestTopics,
        budgetRange: inquiryForm.budgetRange,
        preferredContactTime: inquiryForm.preferredContactTime,
        preferredContactChannel: inquiryForm.preferredContactChannel,
        source: LeadSource.PROPERTY_REQUEST,
        message: inquiryForm.message.trim(),
        website: inquiryForm.website,
      });
      setActiveSidebarTab("request");
      setIsInquirySuccess(true);
      toast.success("Da gui yeu cau tu van thanh cong.");
    } catch (error) {
      console.error(error);
      toast.error("Khong the gui yeu cau tu van luc nay.");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 pb-8 pt-6 md:px-20">
        <button
          type="button"
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
            <PropertyDetailSummary
              property={prop}
              compareItem={compareItem}
              displayPrice={displayPrice}
            />
            <PropertyDetailOverview
              property={prop}
              amenities={amenities}
              show3D={show3D}
              onShow3D={() => setShow3D(true)}
            />
          </div>

          <PropertyDetailSidebar
            property={prop}
            compareItem={compareItem}
            displayPrice={displayPrice}
            pricePerSqm={pricePerSqm}
            isClientLoggedIn={isClientLoggedIn}
            isBookingSuccess={isBookingSuccess}
            isRequestingBooking={isRequestingBooking}
            date={date}
            timeSlot={timeSlot}
            customerNote={customerNote}
            today={today || new Date(0)}
            availabilitySlots={availabilitySlots}
            availableSlotCount={availableSlotCount}
            totalSlotCount={availability?.totalSlots || TOUR_TIME_SLOTS.length}
            isLoadingAvailability={isLoadingAvailability}
            onDateChange={setDate}
            onTimeSlotChange={setTimeSlot}
            onCustomerNoteChange={setCustomerNote}
            onContactAction={handleContactAction}
            onRequestBooking={handleRequestBooking}
            onSendMessage={handleSendMessage}
            onSaveProperty={handleSaveProperty}
            activeTab={activeSidebarTab}
            onTabChange={setActiveSidebarTab}
            isBuyerProfileManaged={isClientLoggedIn}
            isBuyerProfileComplete={getBuyerProfileSnapshot().isComplete}
            onEditBuyerProfile={() => router.push(ROUTES.PROFILE_EDIT)}
            onResetBookingSuccess={() => {
              setIsBookingSuccess(false);
              void refetchAvailability();
            }}
            isInquirySuccess={isInquirySuccess}
            isSubmittingInquiry={isSubmittingLead}
            inquiryForm={inquiryForm}
            onInquiryFieldChange={handleInquiryFieldChange}
            onInquiryTopicToggle={handleInquiryTopicToggle}
            onResetInquirySuccess={() => setIsInquirySuccess(false)}
            isPastTimeSlot={isPastTimeSlot}
          />
        </div>

        <RecommendedPropertiesSection
          properties={visibleRecommendedProperties}
          isLoading={isLoadingRecommended}
          isError={isRecommendedError}
          canLoadMore={canLoadMoreRecommended}
          onLoadMore={() =>
            setVisibleRecommendedCount(
              (currentCount) => currentCount + SIMILAR_PROPERTIES_PAGE_SIZE,
            )
          }
          onRetry={() => {
            void refetchRecommended();
          }}
        />

        {recentlyViewedItems.length > 0 ? (
          <RecentlyViewedSection
            items={recentlyViewedItems}
            maxItems={3}
            className="mt-8"
          />
        ) : null}
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
