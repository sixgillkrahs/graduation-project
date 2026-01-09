"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix default icon issues in React Leaflet
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerClientProps {
  value?: { lat: number; lng: number };
  onChange?: (val: { lat: number; lng: number; address?: any }) => void;
  searchQuery?: string;
  height?: string;
}

// Component to handle clicks on map
const MapEvents = ({ onChange }: { onChange: (e: any) => void }) => {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      onChange(e.latlng);
    },
  });
  return null;
};

// Component to fly to new coords
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15);
  }, [center, map]);
  return null;
};

const MapPickerClient = ({
  value,
  onChange,
  searchQuery,
  height = "300px",
}: MapPickerClientProps) => {
  const [position, setPosition] = useState<[number, number]>([
    10.8231, 106.6297,
  ]); // Default HCMC
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  // Sync value prop to state if provided
  useEffect(() => {
    if (value && value.lat && value.lng) {
      const newPos: [number, number] = [value.lat, value.lng];
      setPosition(newPos);
      setMarkerPos(newPos);
    }
  }, [value]);

  // Handle Search Query (Form -> Map)
  useEffect(() => {
    if (!searchQuery) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            searchQuery
          )}`
        );
        const data = await res.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
          setPosition(newPos);
          setMarkerPos(newPos);
          // Do not call onChange here to avoid loops if query came from form
        }
      } catch (e) {
        console.error("Geocoding error:", e);
      }
    }, 1000); // Debounce
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Map Click (Map -> Form)
  const handleMapClick = async (latlng: any) => {
    const { lat, lng } = latlng;
    setMarkerPos([lat, lng]);

    // Reverse Geocode
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      onChange?.({ lat, lng, address: data });
    } catch (e) {
      onChange?.({ lat, lng });
    }
  };

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: height, width: "100%", borderRadius: "12px", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents onChange={handleMapClick} />
      <MapUpdater center={position} />
      {markerPos && <Marker position={markerPos} />}
    </MapContainer>
  );
};

export default MapPickerClient;
