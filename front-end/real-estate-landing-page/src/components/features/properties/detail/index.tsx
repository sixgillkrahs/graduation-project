"use client";

import { format, isBefore, startOfDay } from "date-fns";
import {
  findOptionLabel,
  formatChatTime,
  LIST_PROVINCE,
  LIST_WARD,
} from "gra-helper";
import {
  ArrowLeft,
  Bath,
  Bed,
  Calendar as CalendarIcon,
  CheckCircle2,
  Compass,
  Heart,
  Map as MapIcon,
  Maximize,
  MessageSquare,
  Phone,
  Share2,
  Star,
  Video,
} from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { PhotoSlider } from "react-photo-view";
import { toast } from "sonner";
import { CsButton } from "@/components/custom";
import CsTabs from "@/components/custom/tabs";
import PropertyCard from "@/components/features/properties/components/PropertyCard";
import PropertyCardSkeleton from "@/components/features/properties/components/PropertyCardSkeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Zalo } from "@/components/ui/Icon/Zalo";
import { Map } from "@/components/ui/Map";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/const/routes";
import { useAppDispatch } from "@/lib/hooks";
import { getPropertyAmenityDisplay } from "@/lib/property-amenities";
import {
  formatPropertyPrice,
  formatPropertyPricePerSqm,
} from "@/lib/property-price";
import { cn } from "@/lib/utils";
import { useGetMe } from "@/shared/auth/query";
import { showAuthDialog } from "@/store/auth-dialog.store";
import { openConversation } from "@/store/chat.store";
import { useCreateConversation } from "../../message/services/mutate";
import { useRequestSchedule } from "../../schedule/services/mutation";
import { useIncreaseView, useRecordInteraction } from "../services/mutate";
import { usePropertyDetail, useRecommendedProperties } from "../services/query";

const TourViewer = dynamic(() => import("./TourViewer"), { ssr: false });
const TOUR_TIME_SLOTS = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const SIMILAR_PROPERTIES_PAGE_SIZE = 3;

const PropertyDetail = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { data: property, isLoading } = usePropertyDetail(id);
  const { data: recommendedData, isLoading: isLoadingRecommended } =
    useRecommendedProperties(id);
  const dispatch = useAppDispatch();
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
  const { data: me } = useGetMe();
  const isClientLoggedIn = Boolean(me?.data?.userId);
  const { mutate: increaseView } = useIncreaseView();
  const { mutateAsync: recordInteraction } = useRecordInteraction();
  const { mutateAsync: createConversation } = useCreateConversation();
  const { mutateAsync: requestBooking, isPending: isRequestingBooking } =
    useRequestSchedule();
  const t = useTranslations("PropertiesPage");
  const locale = useLocale();
  const today = startOfDay(new Date());

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
    if (id) {
      setTimeout(() => {
        increaseView(id);
      }, 3000);
    }
  }, [id, increaseView]);

  useEffect(() => {
    if (!date || !isPastTimeSlot(date, timeSlot)) {
      return;
    }

    const nextAvailableTimeSlot = TOUR_TIME_SLOTS.find(
      (slot) => !isPastTimeSlot(date, slot),
    );

    if (nextAvailableTimeSlot) {
      setTimeSlot(nextAvailableTimeSlot);
      return;
    }

    setTimeSlot("");
  }, [date, timeSlot]);

  useEffect(() => {
    setVisibleRecommendedCount(SIMILAR_PROPERTIES_PAGE_SIZE);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!property?.data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("detail.notFound")}
        </h2>
        <CsButton onClick={() => window.history.back()}>
          {t("detail.goBack")}
        </CsButton>
      </div>
    );
  }

  const prop = property.data;
  const displayPrice = formatPropertyPrice(
    prop.features.price,
    prop.features.priceUnit,
    prop.features.currency,
    locale,
  );
  const pricePerSqm = formatPropertyPricePerSqm(
    prop.features.price,
    prop.features.priceUnit,
    prop.features.area,
    prop.features.currency,
    locale,
  );
  const amenities = (prop.amenities || []).map(getPropertyAmenityDisplay);
  const visibleRecommendedProperties =
    recommendedData?.data?.slice(0, visibleRecommendedCount) || [];
  const canLoadMoreRecommended =
    (recommendedData?.data?.length || 0) > visibleRecommendedCount;

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
          title: "ÄÄƒng nháº­p Ä‘á»ƒ xem LiÃªn há»‡",
          description:
            "Vui lÃ²ng cung cáº¥p tÃ i khoáº£n Ä‘á»ƒ cÃ³ thá»ƒ xem thÃ´ng tin sá»‘ Ä‘iá»‡n thoáº¡i cá»§a ngÆ°á»i bÃ¡n/mÃ´i giá»›i.",
        }),
      );
      return;
    }

    const { phone } = prop.userId;
    const fullPhone = phone ? phone.replace(/^\+84/, "0") : "";

    if (!fullPhone) {
      toast.info(
        "NgÆ°á»i bÃ¡n chÆ°a cáº­p nháº­t thÃ´ng tin sá»‘ Ä‘iá»‡n thoáº¡i.",
      );
      if (type !== "message") return;
    }

    switch (type) {
      case "call":
        window.location.href = `tel:${fullPhone}`;
        break;
      case "zalo":
        window.open(`https://zalo.me/${fullPhone}`, "_blank");
        break;
      case "message":
        // Táº¡o hoáº·c láº¥y há»™i thoáº¡i hiá»‡n táº¡i
        try {
          const res = await createConversation([prop.userId._id]);
          if (res.data) {
            dispatch(openConversation(res.data));
          }
        } catch (error) {
          console.error("Lá»—i khi má»Ÿ chat", error);
        }
        break;
    }
  };

  const handleRequestBooking = async () => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: "ÄÄƒng nháº­p Ä‘á»ƒ Ä‘áº·t lá»‹ch",
          description:
            "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ thá»±c hiá»‡n Ä‘áº·t lá»‹ch háº¹n xem báº¥t Ä‘á»™ng sáº£n nÃ y.",
        }),
      );
      return;
    }

    if (!date) {
      toast.error("Vui lÃ²ng chá»n ngÃ y muá»‘n Ä‘áº·t lá»‹ch");
      return;
    }

    if (isBefore(startOfDay(date), today)) {
      toast.error("Chá»‰ cÃ³ thá»ƒ Ä‘áº·t lá»‹ch tá»« hÃ´m nay trá»Ÿ Ä‘i");
      return;
    }

    if (!timeSlot) {
      toast.error("Vui lÃ²ng chá»n giá» muá»‘n Ä‘áº·t lá»‹ch");
      return;
    }

    if (isPastTimeSlot(date, timeSlot)) {
      toast.error("Giá» háº¹n pháº£i lá»›n hÆ¡n thá»i Ä‘iá»ƒm hiá»‡n táº¡i");
      return;
    }

    try {
      await requestBooking({
        listingId: id,
        customerName: me?.data?.userId?.fullName || "Khách hàng",
        customerPhone: me?.data?.userId?.phone || "",
        customerEmail: me?.data?.userId?.email || "",
        date: date,
        startTime: timeSlot,
        customerNote: customerNote,
      });
      // Optionally fire record interaction
      recordInteraction({ id, type: "SCHEDULE_REQUEST" });
      setIsBookingSuccess(true);
      toast.success("Gửi yêu cầu thành công!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = () => {
    if (!isClientLoggedIn) {
      dispatch(
        showAuthDialog({
          title: "ÄÄƒng nháº­p Ä‘á»ƒ gá»­i tin",
          description:
            "Vui lÃ²ng Ä‘Äƒng nháº­p Ä‘á»ƒ gá»­i yÃªu cáº§u Ä‘áº¿n ngÆ°á»i bÃ¡n/mÃ´i giá»›i.",
        }),
      );
      return;
    }
    toast.info("TÃ­nh nÄƒng gá»­i yÃªu cáº§u Ä‘ang Ä‘Æ°á»£c phÃ¡t triá»ƒn.");
  };

  return (
    <div className="bg-background min-h-screen pb-20 transition-colors duration-300">
      <div className="container mx-auto px-4 md:px-20 pt-6 pb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4 font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("detail.goBack")}
        </button>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
          <div
            className="md:col-span-2 md:row-span-2 relative h-full group cursor-pointer"
            onClick={() => {
              setViewerIndex(0);
              setViewerVisible(true);
            }}
          >
            <Image
              src={
                prop.media.thumbnail ||
                prop.media.images?.[0] ||
                "/placeholder.jpg"
              }
              alt={prop.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="cs-bg-red hover:bg-emerald-700 text-white font-semibold">
                {prop.demandType === "sale"
                  ? t("card.forSale")
                  : t("card.forRent")}
              </Badge>
              {prop.status === "verified" && (
                <Badge className="bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </Badge>
              )}
            </div>

            {prop.media.virtualTourUrls?.length > 0 && (
              <button className="absolute bottom-4 right-4 bg-white text-gray-900 px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-colors z-20">
                <Video className="w-5 h-5 main-color-red" />
                {t("detail.view3DTour")}
              </button>
            )}
          </div>

          {/* Smaller Images Grid */}
          <div className="hidden md:grid grid-cols-2 col-span-2 row-span-2 gap-2">
            {prop.media.images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="h-full relative group cursor-pointer overflow-hidden"
                onClick={() => {
                  setViewerIndex(idx);
                  setViewerVisible(true);
                }}
              >
                <Image
                  src={img}
                  alt={`Gallery ${idx}`}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                {idx === 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                    <span className="text-white font-bold text-lg">
                      {t("detail.viewAllPhotos")}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 md:px-20">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* 2. Left Column (Content - 65%) */}
          <div className="w-full lg:w-[65%] space-y-10">
            {/* Header */}
            <div className="space-y-4">
              <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                <span className="hover:text-emerald-600 cursor-pointer">
                  {t("detail.home")}
                </span>
                <span>/</span>
                <span className="hover:text-emerald-600 cursor-pointer">
                  {findOptionLabel(prop.location.province, LIST_PROVINCE)}
                </span>
                <span>/</span>
                <span className="hover:text-emerald-600 cursor-pointer">
                  {findOptionLabel(prop.location.ward, LIST_WARD)}
                </span>
              </nav>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight">
                {prop.title}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-gray-100 rounded-full">
                    <MapIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span>
                    {prop.location.address},{" "}
                    {findOptionLabel(prop.location.ward, LIST_WARD)},{" "}
                    {findOptionLabel(prop.location.province, LIST_PROVINCE)}
                  </span>
                </div>
                <div className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></div>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    {t("detail.posted", {
                      date: format(new Date(prop.createdAt), "MMM dd, yyyy"),
                    })}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge
                  variant="outline"
                  className="border-emerald-200 text-emerald-700 bg-emerald-50"
                >
                  {prop.propertyType}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-blue-200 text-blue-700 bg-blue-50"
                >
                  {prop.features.legalStatus}
                </Badge>
                <Badge
                  variant="outline"
                  className="border-orange-200 text-orange-700 bg-orange-50"
                >
                  {prop.features.furniture}
                </Badge>
              </div>
            </div>

            {/* Key Specs Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-border">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg border border-border/50">
                  <Bed className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("detail.bedrooms")}
                  </p>
                  <p className="font-bold text-foreground">
                    {prop.features.bedrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg border border-border/50">
                  <Bath className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("detail.bathrooms")}
                  </p>
                  <p className="font-bold text-foreground">
                    {prop.features.bathrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg border border-border/50">
                  <Maximize className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("detail.area")}
                  </p>
                  <p className="font-bold text-foreground">
                    {prop.features.area} m²
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-muted rounded-lg border border-border/50">
                  <Compass className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("detail.direction")}
                  </p>
                  <p className="font-bold text-foreground capitalize">
                    {prop.features.direction || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* 3D Virtual Tour Section */}
            {prop.media.virtualTourUrls?.length > 0 && (
              <section className="scroll-mt-24" id="virtual-tour">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Video className="w-6 h-6 main-color-red" />
                  {t("detail.virtualTour")}
                </h3>
                <div className="relative aspect-[2/1] bg-gray-900 rounded-2xl overflow-hidden shadow-lg">
                  {!show3D ? (
                    <div
                      className="relative w-full h-full group cursor-pointer"
                      onClick={() => setShow3D(true)}
                    >
                      <Image
                        src={prop.media.thumbnail}
                        alt="3D Tour Preview"
                        fill
                        className="object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:bg-red-600 transition-colors duration-300">
                          <Video className="w-8 h-8 text-white fill-current" />
                        </div>
                        <div className="text-center">
                          <h4 className="text-white font-bold text-xl mb-1">
                            {t("detail.clickExplore")}
                          </h4>
                          <p className="text-white/80 text-sm">
                            {t("detail.walkThrough")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <TourViewer urls={prop.media.virtualTourUrls} />
                  )}
                </div>
              </section>
            )}

            {/* Description */}
            <section>
              <h3 className="text-xl font-bold text-foreground mb-4">
                {t("detail.description")}
              </h3>
              <div className="prose prose-emerald max-w-none text-muted-foreground leading-relaxed">
                <p>{prop.description}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3 italic">
                <span>{t("detail.aiEnhanced")}</span>
              </div>
            </section>

            {/* Amenities */}
            {amenities.length > 0 && (
              <section>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {t("detail.amenities")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                  {amenities.map((item) => (
                    <div key={item.value} className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-gray-700 font-medium">
                        {item.translationKey
                          ? t(item.translationKey)
                          : item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Map Location Placeholder */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t("detail.locationOnMap")}
              </h3>
              <div className="w-full h-[300px] bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <Map
                  latitude={prop.location.coordinates.lat}
                  longitude={prop.location.coordinates.long}
                  interactive={false}
                  onLocationSelect={undefined}
                  height={"300px"}
                />
              </div>
            </section>
          </div>

          {/* 3. Right Column (Sticky Sidebar - 35%) */}
          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-24 space-y-6">
              {/* Action Card */}
              <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-md p-6">
                <div className="mb-6">
                  <p className="text-muted-foreground text-sm mb-1">
                    {t("detail.price")}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                      {displayPrice}
                    </span>
                  </div>
                  {pricePerSqm && (
                    <p className="text-sm text-gray-400 mt-1">{pricePerSqm}</p>
                  )}
                </div>

                <div className="border-y border-border py-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-muted border border-border">
                        {prop.userId.avatarUrl ? (
                          <Image
                            src={prop.userId.avatarUrl}
                            alt={prop.userId.fullName}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-xl">
                            {prop.userId.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={ROUTES.AGENT_PUBLIC_PROFILE(prop.userId._id)}
                          className="inline-flex items-center font-bold text-foreground transition-colors hover:text-primary"
                        >
                          {prop.userId.fullName}
                        </Link>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          <span>4.8 (124 reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <CsButton
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12"
                      icon={<Phone className="w-5 h-5 mr-3" />}
                      onClick={() => handleContactAction("call")}
                    >
                      {isClientLoggedIn && prop.userId.phone
                        ? prop.userId.phone.replace(/^\+84/, "0")
                        : "Bấm để xem SĐT"}
                    </CsButton>
                    <div className="grid grid-cols-2 gap-3">
                      <CsButton
                        className="w-full"
                        variant="outline"
                        icon={<MessageSquare className="w-4 h-4 mr-2" />}
                        onClick={() => handleContactAction("message")}
                      >
                        {t("detail.message")}
                      </CsButton>
                      <CsButton
                        className="w-full"
                        variant="outline"
                        icon={<Zalo className="w-4 h-4 mr-2" />}
                        onClick={() => handleContactAction("zalo")}
                      >
                        Chat Zalo
                      </CsButton>
                    </div>
                  </div>
                </div>

                {/* Booking Form Tabs */}
                <div>
                  <CsTabs
                    item={[
                      {
                        value: "tour",
                        label: t("detail.scheduleTour"),
                        content: isBookingSuccess ? (
                          <div className="pt-8 pb-6 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="space-y-2">
                              <p className="font-bold text-foreground text-lg">
                                Gửi yêu cầu thành công!
                              </p>
                              <p className="text-sm text-muted-foreground text-balance">
                                Chúng tôi đã gửi thông tin. Môi giới sẽ sớm liên
                                hệ lại với bạn để xác nhận lịch hẹn.
                              </p>
                            </div>
                            <CsButton
                              className="w-full mt-4"
                              variant="outline"
                              onClick={() => setIsBookingSuccess(false)}
                            >
                              Đặt thêm lịch hẹn khác
                            </CsButton>
                          </div>
                        ) : (
                          <div className="pt-2 space-y-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-11 rounded-lg border border-input bg-background px-4 py-2 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all outline-none",
                                    !date && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {date ? (
                                    format(date, "PPP")
                                  ) : (
                                    <span>{t("detail.pickDate")}</span>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border shadow-md rounded-xl">
                                <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={(selectedDate) => {
                                    if (!selectedDate) {
                                      setDate(undefined);
                                      return;
                                    }

                                    if (
                                      isBefore(startOfDay(selectedDate), today)
                                    ) {
                                      toast.error(
                                        "Chỉ có thể chọn từ hôm nay trở đi",
                                      );
                                      return;
                                    }

                                    setDate(selectedDate);
                                  }}
                                  disabled={(calendarDate) =>
                                    isBefore(startOfDay(calendarDate), today)
                                  }
                                  initialFocus
                                  className="rounded-xl"
                                />
                              </PopoverContent>
                            </Popover>

                            <select
                              className="w-full h-11 rounded-lg border border-input bg-background px-4 py-2 text-foreground outline-none hover:bg-accent/50 transition-all cursor-pointer"
                              value={timeSlot}
                              onChange={(e) => setTimeSlot(e.target.value)}
                            >
                              <option value="" disabled>
                                Chọn giờ hẹn
                              </option>
                              {TOUR_TIME_SLOTS.map((slot) => (
                                <option
                                  key={slot}
                                  value={slot}
                                  disabled={isPastTimeSlot(date, slot)}
                                >
                                  {slot}
                                </option>
                              ))}
                            </select>
                            <p className="text-xs text-muted-foreground -mt-2">
                              Mỗi lịch xem nhà mặc định kéo dài 60 phút.
                            </p>

                            {isClientLoggedIn && (
                              <textarea
                                className="w-full h-20 rounded-lg border border-input bg-background p-3 text-sm outline-none focus:ring-1 focus:ring-ring resize-none transition-all placeholder:text-muted-foreground mt-2"
                                placeholder={
                                  "Thêm ghi chú của bạn cho môi giới..."
                                }
                                value={customerNote}
                                onChange={(e) =>
                                  setCustomerNote(e.target.value)
                                }
                              ></textarea>
                            )}

                            <CsButton
                              className="w-full"
                              variant="default"
                              onClick={handleRequestBooking}
                              loading={isRequestingBooking}
                            >
                              {t("detail.requestBooking")}
                            </CsButton>
                            <p className="text-xs text-center text-muted-foreground">
                              {t("detail.notChargedYet")}
                            </p>
                          </div>
                        ),
                      },
                      {
                        value: "info",
                        label: t("detail.requestInfo"),
                        content: (
                          <div className="pt-2 space-y-4">
                            <textarea
                              className="w-full h-28 rounded-xl border border-input bg-background p-4 text-sm outline-none focus:ring-1 focus:ring-ring resize-none transition-all placeholder:text-muted-foreground"
                              placeholder={t("detail.messagePlaceholder")}
                            ></textarea>
                            <CsButton
                              className="w-full"
                              variant="default"
                              onClick={handleSendMessage}
                            >
                              {t("detail.sendMessage")}
                            </CsButton>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-4">
                {prop.isFavorite ? (
                  <button
                    onClick={() => handleSaveProperty({ action: "UNSAVE" })}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    <Heart className="w-4 h-4" /> {t("detail.saved")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSaveProperty()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-destructive text-sm font-medium transition-colors"
                  >
                    <Heart className="w-4 h-4" /> {t("detail.saveHome")}
                  </button>
                )}
                <div className="w-px h-4 bg-border"></div>
                <button className="flex items-center gap-2 text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
                  <Share2 className="w-4 h-4" /> {t("detail.shareListings")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Homes Section */}
        {!isLoadingRecommended &&
        (!recommendedData?.data ||
          recommendedData?.data?.length === 0) ? null : (
          <section className="mt-20 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                {t("detail.similarHomes")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {isLoadingRecommended
                ? Array.from({ length: 3 }).map((_, i) => (
                    <PropertyCardSkeleton key={i} />
                  ))
                : visibleRecommendedProperties.map((prop) => (
                    <PropertyCard
                      key={prop._id}
                      id={prop._id}
                      image={prop.media?.thumbnail || prop.media?.images?.[0]}
                      title={prop.title}
                      badges={{
                        aiRecommended: true,
                        tour3D: prop.media?.virtualTourUrls?.length > 0,
                      }}
                      address={`${prop.location?.address}, ${findOptionLabel(prop.location?.ward, LIST_WARD)}, ${findOptionLabel(prop.location?.province, LIST_PROVINCE)}`}
                      price={prop.features?.price?.toString()}
                      currency={prop.features?.currency}
                      specs={{
                        beds: prop.features?.bedrooms,
                        baths: prop.features?.bathrooms,
                        area: prop.features?.area,
                      }}
                      unit={prop.features?.priceUnit}
                      agent={{
                        name: prop.userId?.fullName,
                        avatar: prop.userId?.avatarUrl,
                      }}
                      postedAt={formatChatTime(prop.createdAt)}
                      type={prop.demandType === "sale" ? "sale" : "rent"}
                      isFavorite={prop.isFavorite}
                    />
                  ))}
            </div>
            {!isLoadingRecommended && canLoadMoreRecommended && (
              <div className="mt-8 flex justify-center">
                <CsButton
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setVisibleRecommendedCount(
                      (currentCount) =>
                        currentCount + SIMILAR_PROPERTIES_PAGE_SIZE,
                    )
                  }
                >
                  {t("detail.viewMore")}
                </CsButton>
              </div>
            )}
          </section>
        )}
      </main>

      <PhotoSlider
        images={
          prop.media.images?.length > 0
            ? prop.media.images.map((url) => ({ src: url, key: url }))
            : prop.media.thumbnail
              ? [{ src: prop.media.thumbnail, key: "thumbnail" }]
              : [{ src: "/placeholder.jpg", key: "placeholder" }]
        }
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        index={viewerIndex}
        onIndexChange={setViewerIndex}
      />
    </div>
  );
};

export default PropertyDetail;
