"use client";

import { useCallback, useEffect, useState } from "react";
import {
  GoogleMap as GoogleMapComponent,
  Marker,
  useJsApiLoader,
} from "@react-google-maps/api";

interface GoogleMapProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  height?: string;
  draggable?: boolean;
}

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.75rem",
};

// Default to Ho Chi Minh City
const defaultCenter = {
  lat: 10.762622,
  lng: 106.660172,
};

const GoogleMap = ({
  latitude,
  longitude,
  onLocationSelect,
  height = "400px",
  draggable = true,
}: GoogleMapProps) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(latitude && longitude ? { lat: latitude, lng: longitude } : null);

  const center =
    latitude && longitude ? { lat: latitude, lng: longitude } : defaultCenter;

  // Update marker when props change
  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition({ lat: latitude, lng: longitude });
      if (map) {
        map.panTo({ lat: latitude, lng: longitude });
      }
    }
  }, [latitude, longitude, map]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!draggable) return;
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        onLocationSelect?.({ lat, lng });
      }
    },
    [draggable, onLocationSelect],
  );

  const handleMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setMarkerPosition({ lat, lng });
        onLocationSelect?.({ lat, lng });
      }
    },
    [onLocationSelect],
  );

  if (loadError) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-xl text-gray-500"
        style={{ height }}
      >
        Error loading Google Maps
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 rounded-xl animate-pulse"
        style={{ height }}
      >
        <div className="text-gray-400">Loading map...</div>
      </div>
    );
  }

  return (
    <div style={{ height, width: "100%", position: "relative" }}>
      <GoogleMapComponent
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {markerPosition && (
          <Marker
            position={markerPosition}
            draggable={draggable}
            onDragEnd={handleMarkerDragEnd}
            animation={google.maps.Animation.DROP}
          />
        )}
      </GoogleMapComponent>
    </div>
  );
};

export { GoogleMap };
export default GoogleMap;
