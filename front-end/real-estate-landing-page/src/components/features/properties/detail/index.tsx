"use client";

import { CsButton } from "@/components/custom";
import { AuthActionDialog } from "@/components/custom/auth/AuthActionDialog";
import CsTabs from "@/components/custom/tabs";
import { Zalo } from "@/components/ui/Icon/Zalo";
import { Map } from "@/components/ui/Map";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { LIST_PROVINCE, LIST_WARD, findOptionLabel } from "gra-helper";
import {
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
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useIncreaseView, useRecordInteraction } from "../services/mutate";
import { usePropertyDetail } from "../services/query";
import { toast } from "sonner";

const TourViewer = dynamic(() => import("./TourViewer"), { ssr: false });

const PropertyDetail = () => {
  const params = useParams();
  const id = params?.id as string;
  const { data: property, isLoading } = usePropertyDetail(id);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [show3D, setShow3D] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { mutate: increaseView } = useIncreaseView();
  const { mutateAsync: recordInteraction } = useRecordInteraction();

  useEffect(() => {
    if (id) {
      setTimeout(() => {
        increaseView(id);
      }, 3000);
    }
  }, [id, increaseView]);

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
        <h2 className="text-2xl font-bold text-gray-900">Property Not Found</h2>
        <CsButton onClick={() => window.history.back()}>Go Back</CsButton>
      </div>
    );
  }

  const prop = property.data;

  const AMENITIES = [
    { name: "Swimming Pool", icon: "🏊‍♂️" },
    { name: "Gym & Fitness", icon: "💪" },
    { name: "Parking", icon: "🚗" },
    { name: "Elevator", icon: "🛗" },
    { name: "24/7 Security", icon: "🛡️" },
    { name: "Wifi & Internet", icon: "📶" },
  ];

  const handleSaveProperty = async (metadata?: Record<string, unknown>) => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      setShowLoginDialog(true);
      return;
    }
    await recordInteraction({ id, type: "FAVORITE", metadata });
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-20 pt-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden relative">
          <div className="md:col-span-2 md:row-span-2 relative h-full group cursor-pointer">
            <Image
              src={prop.media.thumbnail || "/placeholder.jpg"}
              alt={prop.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="cs-bg-red hover:bg-emerald-700 text-white font-semibold">
                For {prop.demandType === "sale" ? "Sale" : "Rent"}
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
                View 3D Tour 360°
              </button>
            )}
          </div>

          {/* Smaller Images Grid */}
          <div className="hidden md:grid grid-cols-2 col-span-2 row-span-2 gap-2">
            {prop.media.images.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className="relative h-full relative group cursor-pointer overflow-hidden"
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
                      View all photos
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
                  Home
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
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                {prop.title}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-4 text-gray-500">
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
                    Posted {format(new Date(prop.createdAt), "MMM dd, yyyy")}
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <Bed className="w-6 h-6 main-color-red" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bedrooms</p>
                  <p className="font-bold text-gray-900">
                    {prop.features.bedrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <Bath className="w-6 h-6 main-color-red" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bathrooms</p>
                  <p className="font-bold text-gray-900">
                    {prop.features.bathrooms}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <Maximize className="w-6 h-6 main-color-red" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Area</p>
                  <p className="font-bold text-gray-900">
                    {prop.features.area} m²
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-lg">
                  <Compass className="w-6 h-6 main-color-red" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Direction</p>
                  <p className="font-bold text-gray-900 capitalize">
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
                  3D Virtual Tour
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
                            Click to Explore 360°
                          </h4>
                          <p className="text-white/80 text-sm">
                            Walk through the property from home
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
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Description
              </h3>
              <div className="prose prose-emerald max-w-none text-gray-600 leading-relaxed">
                <p>{prop.description}</p>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3 italic">
                <span>✨ Description enhanced by AI</span>
              </div>
            </section>

            {/* Amenities */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Amenities & Features
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                {AMENITIES.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <span className="text-gray-700 font-medium">
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Map Location Placeholder */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Location on Map
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
              <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-100/50 p-6">
                <div className="mb-6">
                  <p className="text-gray-500 text-sm mb-1">Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold main-color-red">
                      {prop.features.price} Billion
                    </span>
                    <span className="text-gray-400 font-medium">VND</span>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    ~{(prop.features.price * 1000) / prop.features.area} Million
                    VND / m²
                  </p>
                </div>

                <div className="border-t border-b border-gray-100 py-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                        {prop.userId.avatarUrl ? (
                          <Image
                            src={prop.userId.avatarUrl}
                            alt={prop.userId.fullName}
                            width={48}
                            height={48}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold text-xl">
                            {prop.userId.fullName.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">
                          {prop.userId.fullName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          <span>4.8 (124 reviews)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <CsButton
                      className="w-full"
                      icon={<Phone className="w-4 h-4 mr-2" />}
                    >
                      Call
                    </CsButton>
                    <CsButton
                      className="w-full"
                      icon={<MessageSquare className="w-4 h-4 mr-2" />}
                    >
                      Message
                    </CsButton>
                    <CsButton
                      className="w-full"
                      icon={<Zalo className="w-4 h-4 mr-2" />}
                    >
                      Zalo
                    </CsButton>
                  </div>
                </div>

                {/* Booking Form Tabs */}
                <div>
                  <CsTabs
                    item={[
                      {
                        value: "tour",
                        label: "Schedule Tour",
                        content: (
                          <div className="pt-4 space-y-4">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  className={cn(
                                    "w-full justify-start text-left font-normal h-12 rounded-xl border border-gray-200 px-4 flex items-center gap-2 hover:border-emerald-500 transition-colors",
                                    !date && "text-muted-foreground",
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 main-color-red" />
                                  {date ? (
                                    format(date, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 border-none shadow-xl rounded-xl">
                                <Calendar
                                  mode="single"
                                  selected={date}
                                  onSelect={setDate}
                                  initialFocus
                                  className="rounded-xl border shadow-none"
                                />
                              </PopoverContent>
                            </Popover>

                            <select className="w-full h-12 rounded-xl border border-gray-200 px-4 text-gray-700 outline-none focus:border-emerald-500 bg-white cursor-pointer">
                              <option>10:00 AM</option>
                              <option>02:00 PM</option>
                              <option>04:00 PM</option>
                            </select>

                            <CsButton className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-200">
                              Request Booking
                            </CsButton>
                            <p className="text-xs text-center text-gray-400">
                              You won&apos;t be charged yet
                            </p>
                          </div>
                        ),
                      },
                      {
                        value: "info",
                        label: "Request Info",
                        content: (
                          <div className="pt-4 space-y-4">
                            <textarea
                              className="w-full h-32 rounded-xl border border-gray-200 p-4 text-sm outline-none focus:border-emerald-500 resize-none"
                              placeholder="Hello, I am interested in [Property Name]..."
                            ></textarea>
                            <CsButton className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                              Send Message
                            </CsButton>
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-center gap-4">
                {/* <button
                  onClick={handleSaveProperty}
                  className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
                >
                  <Heart className="w-4 h-4" /> Save this home
                </button> */}
                {prop.isFavorite ? (
                  <button
                    onClick={() => handleSaveProperty({ action: "UNSAVE" })}
                    className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                  >
                    <Heart className="w-4 h-4" /> Saved
                  </button>
                ) : (
                  <button
                    onClick={() => handleSaveProperty()}
                    className="flex items-center gap-2 text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
                  >
                    <Heart className="w-4 h-4" /> Save this home
                  </button>
                )}
                <div className="w-px h-4 bg-gray-300"></div>
                <button className="flex items-center gap-2 text-gray-500 hover:text-emerald-600 text-sm font-medium transition-colors">
                  <Share2 className="w-4 h-4" /> Share this listing
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Homes Section */}
        <section className="mt-20 pt-10 border-t border-gray-200">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Similar Homes You Might Like
            </h2>
            <button className="text-emerald-600 font-bold hover:underline">
              View All
            </button>
          </div>
          {/* Placeholder for Similar Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Using skeleton or mock cards if no data, logic to fetch similar items needed */}
            <div className="bg-gray-50 h-80 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
              <p className="text-gray-400 font-medium">Similar Property #1</p>
            </div>
            <div className="bg-gray-50 h-80 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
              <p className="text-gray-400 font-medium">Similar Property #2</p>
            </div>
            <div className="bg-gray-50 h-80 rounded-2xl flex items-center justify-center border border-dashed border-gray-300">
              <p className="text-gray-400 font-medium">Similar Property #3</p>
            </div>
          </div>
        </section>
      </main>

      <AuthActionDialog
        open={showLoginDialog}
        onOpenChange={setShowLoginDialog}
        title="Đăng nhập để lưu tin"
        description="Hãy đăng nhập để lưu lại tin đăng này và dễ dàng tìm lại trong danh sách yêu thích của bạn!"
      />
    </div>
  );
};

export default PropertyDetail;
