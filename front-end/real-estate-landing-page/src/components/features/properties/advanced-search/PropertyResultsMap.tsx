"use client";

import maplibregl, { LngLatBounds } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MapGL, {
  MapRef,
  Marker,
  NavigationControl,
} from "react-map-gl/maplibre";
import { useTranslations } from "next-intl";
import { formatPropertyPrice } from "@/lib/property-price";

type PropertyMapItem = {
  id: string;
  title: string;
  price: number;
  currency?: "VND" | "USD";
  unit?: string;
  address: string;
  type: "sale" | "rent";
  latitude: number;
  longitude: number;
};

interface PropertyResultsMapProps {
  items: PropertyMapItem[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}

const DEFAULT_CENTER = {
  latitude: 10.762622,
  longitude: 106.660172,
  zoom: 11,
};

const PropertyResultsMap = ({
  items,
  activeId,
  onSelect,
}: PropertyResultsMapProps) => {
  const t = useTranslations("PropertiesPage.advancedSearch.map");
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState(DEFAULT_CENTER);
  const [isMapReady, setIsMapReady] = useState(false);

  const activeItem = useMemo(
    () => items.find((item) => item.id === activeId) || items[0],
    [activeId, items],
  );

  useEffect(() => {
    const mapInstance = mapRef.current?.getMap();

    if (
      !items.length ||
      !mapRef.current ||
      !mapInstance ||
      !mapInstance.loaded()
    ) {
      return;
    }

    if (items.length === 1) {
      mapRef.current.flyTo({
        center: [items[0].longitude, items[0].latitude],
        zoom: 14,
        duration: 1200,
      });
      return;
    }

    const bounds = new LngLatBounds();
    items.forEach((item) => bounds.extend([item.longitude, item.latitude]));
    mapRef.current.fitBounds(bounds, {
      padding: 56,
      duration: 1200,
    });
  }, [items, isMapReady]);

  useEffect(() => {
    const mapInstance = mapRef.current?.getMap();

    if (
      !activeItem ||
      !mapRef.current ||
      !mapInstance ||
      !mapInstance.loaded()
    ) {
      return;
    }

    mapRef.current.flyTo({
      center: [activeItem.longitude, activeItem.latitude],
      zoom: Math.max(mapRef.current.getZoom(), 13),
      duration: 900,
    });
  }, [activeItem, isMapReady]);

  if (!items.length) {
    return (
      <div className="flex h-full min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-stone-300 bg-stone-50 p-6 text-center text-stone-500">
        <div className="max-w-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-400">
            {t("emptyEyebrow")}
          </p>
          <p className="mt-3 text-lg font-semibold text-stone-900">
            {t("emptyTitle")}
          </p>
          <p className="mt-2 text-sm leading-6">{t("emptyDescription")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-[420px] overflow-hidden rounded-[28px] border border-stone-200 bg-white shadow-sm">
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={(event) => setViewState(event.viewState)}
        onLoad={() => setIsMapReady(true)}
        mapLib={maplibregl}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        {isMapReady ? <NavigationControl position="top-right" /> : null}

        {isMapReady
          ? items.map((item) => {
          const isActive = item.id === activeItem?.id;

          return (
            <Marker
              key={item.id}
              longitude={item.longitude}
              latitude={item.latitude}
              anchor="bottom"
            >
              <button
                type="button"
                onClick={() => onSelect?.(item.id)}
                className={`group flex -translate-y-2 flex-col items-center ${
                  isActive ? "z-20" : "z-10"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold shadow-lg transition-all ${
                    isActive
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-white bg-white text-stone-900 hover:border-stone-300"
                  }`}
                >
                  {formatPropertyPrice(
                    item.price,
                    item.unit,
                    item.currency || "VND",
                  )}
                </span>
                <span
                  className={`mt-1 inline-flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${
                    isActive
                      ? "bg-red-500 text-white"
                      : "bg-white text-red-500 group-hover:bg-red-50"
                  }`}
                >
                  <MapPin className="h-5 w-5" />
                </span>
              </button>
            </Marker>
          );
          })
          : null}

      </MapGL>

      {activeItem ? (
        <div className="pointer-events-none absolute bottom-4 left-4 right-4 z-20 sm:right-auto sm:max-w-sm">
          <div className="rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.45)] backdrop-blur">
            <p className="line-clamp-2 text-sm font-semibold text-stone-900">
              {activeItem.title}
            </p>
            <p className="mt-1 line-clamp-2 text-xs text-stone-500">
              {activeItem.address}
            </p>
            <p className="mt-3 text-sm font-bold text-stone-900">
              {formatPropertyPrice(
                activeItem.price,
                activeItem.unit,
                activeItem.currency || "VND",
              )}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export type { PropertyMapItem };
export default PropertyResultsMap;
