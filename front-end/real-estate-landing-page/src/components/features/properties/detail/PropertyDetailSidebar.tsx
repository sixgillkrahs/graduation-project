"use client";

import { CsButton } from "@/components/custom";
import CsTabs from "@/components/custom/tabs";
import { Zalo } from "@/components/ui/Icon/Zalo";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ROUTES } from "@/const/routes";
import { cn } from "@/lib/utils";
import { format, isBefore, startOfDay } from "date-fns";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Heart,
  MessageSquare,
  Phone,
  Share2,
  Star,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { PropertyDto } from "../dto/property.dto";

interface PropertyDetailSidebarProps {
  property: PropertyDto & { isFavorite: boolean };
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
  onDateChange: (date?: Date) => void;
  onTimeSlotChange: (slot: string) => void;
  onCustomerNoteChange: (note: string) => void;
  onContactAction: (type: "call" | "message" | "zalo") => void;
  onRequestBooking: () => void;
  onSendMessage: () => void;
  onSaveProperty: (metadata?: Record<string, unknown>) => void;
  onResetBookingSuccess: () => void;
  isPastTimeSlot: (selectedDate: Date | undefined, slot: string) => boolean;
}

const PropertyDetailSidebar = ({
  property,
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
  onDateChange,
  onTimeSlotChange,
  onContactAction,
  onCustomerNoteChange,
  onRequestBooking,
  onSendMessage,
  onSaveProperty,
  onResetBookingSuccess,
  isPastTimeSlot,
}: PropertyDetailSidebarProps) => {
  const t = useTranslations("PropertiesPage");

  return (
    <div className="relative w-full lg:w-[35%]">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-md">
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
                  <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span>4.8 (124 reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <CsButton
                className="h-12 w-full bg-emerald-600 font-bold text-white hover:bg-emerald-700"
                icon={<Phone className="mr-3 h-5 w-5" />}
                onClick={() => onContactAction("call")}
              >
                {isClientLoggedIn && property.userId.phone
                  ? property.userId.phone.replace(/^\+84/, "0")
                  : "Bam de xem SDT"}
              </CsButton>

              <div className="grid grid-cols-2 gap-3">
                <CsButton
                  className="w-full"
                  variant="outline"
                  icon={<MessageSquare className="mr-2 h-4 w-4" />}
                  onClick={() => onContactAction("message")}
                >
                  {t("detail.message")}
                </CsButton>
                <CsButton
                  className="w-full"
                  variant="outline"
                  icon={<Zalo className="mr-2 h-4 w-4" />}
                  onClick={() => onContactAction("zalo")}
                >
                  Chat Zalo
                </CsButton>
              </div>
            </div>
          </div>

          <CsTabs
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
                        Gui yeu cau thanh cong!
                      </p>
                      <p className="text-balance text-sm text-muted-foreground">
                        Chung toi da gui thong tin. Moi gioi se som lien he lai
                        voi ban de xac nhan lich hen.
                      </p>
                    </div>
                    <CsButton
                      className="mt-4 w-full"
                      variant="outline"
                      onClick={onResetBookingSuccess}
                    >
                      Dat them lich hen khac
                    </CsButton>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
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
                value: "info",
                label: t("detail.requestInfo"),
                content: (
                  <div className="space-y-4 pt-2">
                    <textarea
                      className="h-28 w-full resize-none rounded-xl border border-input bg-background p-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:ring-1 focus:ring-ring"
                      placeholder={t("detail.messagePlaceholder")}
                    />
                    <CsButton
                      className="w-full"
                      variant="default"
                      onClick={onSendMessage}
                    >
                      {t("detail.sendMessage")}
                    </CsButton>
                  </div>
                ),
              },
            ]}
          />
        </div>

        <div className="mt-4 flex justify-center gap-4">
          {property.isFavorite ? (
            <button
              onClick={() => onSaveProperty({ action: "UNSAVE" })}
              className="flex items-center gap-2 text-sm font-medium text-red-500 transition-colors hover:text-red-600"
            >
              <Heart className="h-4 w-4" /> {t("detail.saved")}
            </button>
          ) : (
            <button
              onClick={() => onSaveProperty()}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <Heart className="h-4 w-4" /> {t("detail.saveHome")}
            </button>
          )}
          <div className="h-4 w-px bg-border" />
          <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            <Share2 className="h-4 w-4" /> {t("detail.shareListings")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailSidebar;
