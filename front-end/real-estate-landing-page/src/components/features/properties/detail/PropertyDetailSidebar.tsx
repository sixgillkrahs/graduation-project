"use client";

import { format, isBefore, startOfDay } from "date-fns";
import {
  ArrowUpRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Heart,
  LoaderCircle,
  MessageSquare,
  Phone,
  Share2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CsButton } from "@/components/custom";
import CsTabs from "@/components/custom/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/const/routes";
import { cn } from "@/lib/utils";
import {
  LeadContactChannel,
  LeadContactTime,
  LeadIntent,
} from "../../leads/services/type";
import { useGetPublicAgentReviews } from "../../reviews/services/query";
import type { PropertyCompareItem } from "../compare/compare.types";
import PropertyCompareToggleButton from "../compare/PropertyCompareToggleButton";
import type { PropertyDto } from "../dto/property.dto";

interface PropertyDetailSidebarProps {
  property: PropertyDto & { isFavorite: boolean };
  compareItem: PropertyCompareItem;
  displayPrice: string;
  pricePerSqm: string | null;
  isClientLoggedIn: boolean;
  isBookingSuccess: boolean;
  isRequestingBooking: boolean;
  date?: Date;
  timeSlot: string;
  customerNote: string;
  today: Date;
  tourTimeSlots: string[];
  activeTab: string;
  isBuyerProfileManaged: boolean;
  isBuyerProfileComplete: boolean;
  onDateChange: (date?: Date) => void;
  onTimeSlotChange: (slot: string) => void;
  onCustomerNoteChange: (note: string) => void;
  onContactAction: (type: "call" | "chat" | "request") => void;
  onTabChange: (value: string) => void;
  onEditBuyerProfile: () => void;
  onRequestBooking: () => void;
  onSendMessage: () => void;
  onSaveProperty: (metadata?: Record<string, unknown>) => void;
  onResetBookingSuccess: () => void;
  isInquirySuccess: boolean;
  isSubmittingInquiry: boolean;
  inquiryForm: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    intent: LeadIntent;
    interestTopics: string[];
    budgetRange: string;
    preferredContactTime: LeadContactTime;
    preferredContactChannel: LeadContactChannel;
    message: string;
    website: string;
  };
  onInquiryFieldChange: (
    field:
      | "customerName"
      | "customerPhone"
      | "customerEmail"
      | "intent"
      | "budgetRange"
      | "preferredContactTime"
      | "preferredContactChannel"
      | "message"
      | "website",
    value: string,
  ) => void;
  onInquiryTopicToggle: (topic: string) => void;
  onResetInquirySuccess: () => void;
  isPastTimeSlot: (selectedDate: Date | undefined, slot: string) => boolean;
}

const PropertyDetailSidebar = ({
  property,
  compareItem,
  displayPrice,
  pricePerSqm,
  isClientLoggedIn,
  isBookingSuccess,
  isRequestingBooking,
  date,
  timeSlot,
  customerNote,
  today,
  tourTimeSlots,
  activeTab,
  isBuyerProfileManaged,
  isBuyerProfileComplete,
  onDateChange,
  onTimeSlotChange,
  onContactAction,
  onCustomerNoteChange,
  onTabChange,
  onEditBuyerProfile,
  onRequestBooking,
  onSendMessage,
  onSaveProperty,
  onResetBookingSuccess,
  isInquirySuccess,
  isSubmittingInquiry,
  inquiryForm,
  onInquiryFieldChange,
  onInquiryTopicToggle,
  onResetInquirySuccess,
  isPastTimeSlot,
}: PropertyDetailSidebarProps) => {
  const t = useTranslations("PropertiesPage");
  const { data: publicReviewsData, isLoading: isLoadingPublicReviews } =
    useGetPublicAgentReviews(property.userId._id, {
      page: 1,
      limit: 1,
    });
  const reviewsSummary = publicReviewsData?.data?.summary;
  const hasPublishedReviews = Boolean(reviewsSummary?.totalReviews);
  const inquiryTopics = [
    { value: "PRICE", label: "Price" },
    { value: "LEGAL", label: "Legal" },
    { value: "LOCATION", label: "Location" },
    { value: "NEGOTIATION", label: "Negotiation" },
    { value: "VIEWING", label: "Viewing" },
    { value: "FURNITURE", label: "Furniture" },
  ];
  const focusActionPanel = (nextTab: "tour" | "request") => {
    onTabChange(nextTab);

    window.requestAnimationFrame(() => {
      document
        .getElementById("property-contact-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="relative w-full pb-24 lg:w-[35%] lg:pb-0">
      <div className="sticky top-24 space-y-6">
        <div
          id="property-contact-panel"
          className="scroll-mt-28 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-md"
        >
          <div className="mb-6">
            <p className="mb-1 text-sm text-muted-foreground">
              {t("detail.price")}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">
                {displayPrice}
              </span>
            </div>
            {pricePerSqm && (
              <p className="mt-1 text-sm text-gray-400">{pricePerSqm}</p>
            )}
          </div>

          <div className="mb-6 border-y border-border py-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-border bg-muted">
                  {property.userId.avatarUrl ? (
                    <Image
                      src={property.userId.avatarUrl}
                      alt={property.userId.fullName}
                      width={48}
                      height={48}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/10 text-xl font-bold text-primary">
                      {property.userId.fullName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <Link
                    href={ROUTES.AGENT_PUBLIC_PROFILE(property.userId._id)}
                    className="inline-flex items-center font-bold text-foreground transition-colors hover:text-primary"
                  >
                    {property.userId.fullName}
                  </Link>
                  {isLoadingPublicReviews ? (
                    <div className="mt-1 flex items-center gap-1 text-xs font-medium text-muted-foreground">
                      <LoaderCircle className="h-3 w-3 animate-spin" />
                      <span>Loading reviews...</span>
                    </div>
                  ) : hasPublishedReviews ? (
                    <div className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-500">
                      <Star className="h-3 w-3 fill-current" />
                      <span>
                        {reviewsSummary?.averageRating?.toFixed(1)} (
                        {reviewsSummary?.totalReviews} reviews)
                      </span>
                    </div>
                  ) : (
                    <div className="mt-1 text-xs font-medium text-muted-foreground">
                      No published reviews yet
                    </div>
                  )}
                  <Link
                    href={ROUTES.AGENT_PUBLIC_PROFILE(property.userId._id)}
                    className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    View agent profile
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <CsButton
                className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                icon={<Phone className="mr-3 h-5 w-5" />}
                onClick={() => onContactAction("call")}
              >
                Call agent
              </CsButton>
              <CsButton
                className="h-12 w-full"
                variant="outline"
                icon={<MessageSquare className="mr-2 h-4 w-4" />}
                onClick={() => onContactAction("chat")}
              >
                Chat now
              </CsButton>
              <CsButton
                className="h-12 w-full"
                variant="outline"
                onClick={() => onContactAction("request")}
              >
                Send request
              </CsButton>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Every action is tracked into the agent CRM so they can follow up
                with the right context.
                {isClientLoggedIn && property.userId.phone ? (
                  <span className="mt-1 block font-medium text-amber-900">
                    Direct line: {property.userId.phone.replace(/^\+84/, "0")}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <CsTabs
            value={activeTab}
            onValueChange={onTabChange}
            item={[
              {
                value: "tour",
                label: t("detail.scheduleTour"),
                content: isBookingSuccess ? (
                  <div className="flex flex-col items-center justify-center space-y-4 pb-6 pt-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-foreground">
                        Booking request sent
                      </p>
                      <p className="text-balance text-sm text-muted-foreground">
                        Your appointment is now in{" "}
                        <span className="font-semibold text-amber-600">
                          Pending
                        </span>{" "}
                        status. The agent still needs to confirm, reject, or let
                        it expire if the slot is no longer available.
                      </p>
                    </div>
                    <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-left text-sm text-amber-800">
                      Track the full status flow in My Appointments: Pending,
                      Confirmed, Cancelled, Completed, or Expired.
                    </div>
                    <Link
                      href={ROUTES.PROFILE_APPOINTMENTS}
                      className="mt-4 w-full"
                    >
                      <CsButton className="w-full" variant="outline">
                        Open My Appointments
                      </CsButton>
                    </Link>
                    <CsButton
                      className="w-full"
                      variant="outline"
                      onClick={onResetBookingSuccess}
                    >
                      Book another slot
                    </CsButton>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            "flex h-11 w-full items-center gap-2 rounded-lg border border-input bg-background px-4 py-2 text-left font-normal outline-none transition-all hover:bg-accent hover:text-accent-foreground",
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
                      <PopoverContent className="w-auto rounded-xl border p-0 shadow-md">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(selectedDate) => {
                            if (!selectedDate) {
                              onDateChange(undefined);
                              return;
                            }

                            if (isBefore(startOfDay(selectedDate), today)) {
                              toast.error("Chi co the chon tu hom nay tro di");
                              return;
                            }

                            onDateChange(selectedDate);
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
                      className="h-11 w-full cursor-pointer rounded-lg border border-input bg-background px-4 py-2 text-foreground outline-none transition-all hover:bg-accent/50"
                      value={timeSlot}
                      onChange={(event) => onTimeSlotChange(event.target.value)}
                    >
                      <option value="" disabled>
                        Chon gio hen
                      </option>
                      {tourTimeSlots.map((slot) => (
                        <option
                          key={slot}
                          value={slot}
                          disabled={isPastTimeSlot(date, slot)}
                        >
                          {slot}
                        </option>
                      ))}
                    </select>

                    <p className="-mt-2 text-xs text-muted-foreground">
                      Moi lich xem nha mac dinh keo dai 60 phut.
                    </p>

                    {isClientLoggedIn && (
                      <textarea
                        className="mt-2 h-20 w-full resize-none rounded-lg border border-input bg-background p-3 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                        placeholder="Them ghi chu cua ban cho moi gioi..."
                        value={customerNote}
                        onChange={(event) =>
                          onCustomerNoteChange(event.target.value)
                        }
                      />
                    )}

                    <CsButton
                      className="w-full"
                      variant="default"
                      onClick={onRequestBooking}
                      loading={isRequestingBooking}
                    >
                      {t("detail.requestBooking")}
                    </CsButton>
                    <p className="text-center text-xs text-muted-foreground">
                      {t("detail.notChargedYet")}
                    </p>
                  </div>
                ),
              },
              {
                value: "request",
                label: "Send request",
                content: isInquirySuccess ? (
                  <div className="flex flex-col items-center justify-center space-y-4 pb-6 pt-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-lg font-bold text-foreground">
                        Yeu cau da duoc ghi nhan
                      </p>
                      <p className="text-balance text-sm text-muted-foreground">
                        Agent se lien he theo khung gio ban chon. Lead da duoc
                        day vao CRM de theo doi.
                      </p>
                    </div>
                    <CsButton
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={onResetInquirySuccess}
                    >
                      Gui them mot yeu cau khac
                    </CsButton>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    {isBuyerProfileManaged && (
                      <div
                        className={cn(
                          "rounded-2xl border px-4 py-3 text-sm",
                          isBuyerProfileComplete
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "border-amber-200 bg-amber-50 text-amber-800",
                        )}
                      >
                        <p className="font-medium">
                          {isBuyerProfileComplete
                            ? "Buyer profile linked"
                            : "Buyer profile incomplete"}
                        </p>
                        <p className="mt-1">
                          {isBuyerProfileComplete
                            ? "Display name, phone number, and email will be pulled from your buyer profile for this inquiry."
                            : "Complete your buyer profile so every appointment and inquiry reaches the agent with your full contact details."}
                        </p>
                        <CsButton
                          className="mt-3"
                          variant="outline"
                          type="button"
                          onClick={onEditBuyerProfile}
                        >
                          Edit buyer profile
                        </CsButton>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                        placeholder="Full name"
                        value={inquiryForm.customerName}
                        readOnly={isBuyerProfileManaged}
                        onChange={(event) =>
                          onInquiryFieldChange(
                            "customerName",
                            event.target.value,
                          )
                        }
                      />
                      <input
                        className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                        placeholder="Phone number"
                        value={inquiryForm.customerPhone}
                        readOnly={isBuyerProfileManaged}
                        onChange={(event) =>
                          onInquiryFieldChange(
                            "customerPhone",
                            event.target.value,
                          )
                        }
                      />
                    </div>

                    <input
                      className="h-11 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                      placeholder="Email (optional)"
                      value={inquiryForm.customerEmail}
                      readOnly={isBuyerProfileManaged}
                      onChange={(event) =>
                        onInquiryFieldChange(
                          "customerEmail",
                          event.target.value,
                        )
                      }
                    />

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <select
                        className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:ring-1 focus:ring-ring"
                        value={inquiryForm.intent}
                        onChange={(event) =>
                          onInquiryFieldChange("intent", event.target.value)
                        }
                      >
                        <option value={LeadIntent.BUY_TO_LIVE}>
                          Buying to live
                        </option>
                        <option value={LeadIntent.INVEST}>Investment</option>
                        <option value={LeadIntent.RENT}>Renting</option>
                        <option value={LeadIntent.CONSULTATION}>
                          Need consultation
                        </option>
                      </select>
                      <select
                        className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:ring-1 focus:ring-ring"
                        value={inquiryForm.budgetRange}
                        onChange={(event) =>
                          onInquiryFieldChange(
                            "budgetRange",
                            event.target.value,
                          )
                        }
                      >
                        <option value="">Select budget</option>
                        <option value="UNDER_2_BILLION">Under 2 billion</option>
                        <option value="FROM_2_TO_5_BILLION">
                          2 - 5 billion
                        </option>
                        <option value="ABOVE_5_BILLION">Above 5 billion</option>
                        <option value="UNDER_15_MILLION_RENT">
                          Rent under 15 million
                        </option>
                        <option value="ABOVE_15_MILLION_RENT">
                          Rent above 15 million
                        </option>
                        <option value="FLEXIBLE">Flexible</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">
                        Main interests
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {inquiryTopics.map((topic) => {
                          const selected = inquiryForm.interestTopics.includes(
                            topic.value,
                          );

                          return (
                            <button
                              key={topic.value}
                              type="button"
                              onClick={() => onInquiryTopicToggle(topic.value)}
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                                selected
                                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                  : "border-border bg-background text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                              )}
                            >
                              {topic.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <select
                        className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:ring-1 focus:ring-ring"
                        value={inquiryForm.preferredContactTime}
                        onChange={(event) =>
                          onInquiryFieldChange(
                            "preferredContactTime",
                            event.target.value,
                          )
                        }
                      >
                        <option value={LeadContactTime.ASAP}>
                          Contact ASAP
                        </option>
                        <option value={LeadContactTime.TODAY}>Today</option>
                        <option value={LeadContactTime.NEXT_24_HOURS}>
                          Within 24 hours
                        </option>
                        <option value={LeadContactTime.THIS_WEEKEND}>
                          This weekend
                        </option>
                      </select>
                      <select
                        className="h-11 rounded-xl border border-input bg-background px-4 text-sm outline-none transition-all focus:ring-1 focus:ring-ring"
                        value={inquiryForm.preferredContactChannel}
                        onChange={(event) =>
                          onInquiryFieldChange(
                            "preferredContactChannel",
                            event.target.value,
                          )
                        }
                      >
                        <option value={LeadContactChannel.PHONE}>Phone</option>
                        <option value={LeadContactChannel.CHAT}>Chat</option>
                        <option value={LeadContactChannel.EMAIL}>Email</option>
                      </select>
                    </div>

                    <textarea
                      className="h-28 w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                      placeholder="Tell the agent what you want to know about this property."
                      value={inquiryForm.message}
                      onChange={(event) =>
                        onInquiryFieldChange("message", event.target.value)
                      }
                    />
                    <input
                      className="hidden"
                      tabIndex={-1}
                      autoComplete="off"
                      value={inquiryForm.website}
                      onChange={(event) =>
                        onInquiryFieldChange("website", event.target.value)
                      }
                    />
                    <CsButton
                      className="w-full"
                      variant="default"
                      onClick={onSendMessage}
                      loading={isSubmittingInquiry}
                    >
                      Send request
                    </CsButton>
                    <p className="text-center text-xs text-muted-foreground">
                      We will pass this inquiry straight to the agent CRM.
                    </p>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <div className="mt-4 flex justify-center gap-4">
          {property.isFavorite ? (
            <button
              type="button"
              onClick={() => onSaveProperty({ action: "UNSAVE" })}
              className="flex items-center gap-2 text-sm font-medium text-red-500 transition-colors hover:text-red-600"
            >
              <Heart className="h-4 w-4" /> {t("detail.saved")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSaveProperty()}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <Heart className="h-4 w-4" /> {t("detail.saveHome")}
            </button>
          )}
          <div className="h-4 w-px bg-border" />
          <PropertyCompareToggleButton item={compareItem} variant="text" />
          <div className="h-4 w-px bg-border" />
          <button
            type="button"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Share2 className="h-4 w-4" /> {t("detail.shareListings")}
          </button>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-screen-sm grid-cols-4 gap-2">
          <CsButton
            className="h-12 bg-emerald-600 px-2 text-xs font-semibold text-white hover:bg-emerald-700"
            onClick={() => onContactAction("call")}
          >
            <span className="flex flex-col items-center gap-1">
              <Phone className="h-4 w-4" />
              Call
            </span>
          </CsButton>
          <CsButton
            className="h-12 px-2 text-xs font-semibold"
            variant="outline"
            onClick={() => onContactAction("chat")}
          >
            <span className="flex flex-col items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Chat
            </span>
          </CsButton>
          <CsButton
            className="h-12 px-2 text-xs font-semibold"
            variant="outline"
            onClick={() => focusActionPanel("request")}
          >
            <span className="flex flex-col items-center gap-1">
              <ArrowUpRight className="h-4 w-4" />
              Request
            </span>
          </CsButton>
          <CsButton
            className="h-12 px-2 text-xs font-semibold"
            variant={activeTab === "tour" ? "default" : "outline"}
            onClick={() => focusActionPanel("tour")}
          >
            <span className="flex flex-col items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Tour
            </span>
          </CsButton>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailSidebar;
