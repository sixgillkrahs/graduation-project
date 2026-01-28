"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useRef, useState } from "react";
import MapGL, {
  GeolocateControl,
  MapRef,
  Marker,
  NavigationControl,
} from "react-map-gl/maplibre";

interface MapProps {
  latitude?: number | null;
  longitude?: number | null;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
  height?: string;
  interactive?: boolean;
}

// Default to Ho Chi Minh City
const DEFAULT_CENTER = {
  latitude: 10.762622,
  longitude: 106.660172,
};

function Map({
  latitude,
  longitude,
  onLocationSelect,
  height = "400px",
  interactive = true,
}: MapProps) {
  const mapRef = useRef<MapRef>(null);

  const [viewState, setViewState] = useState({
    longitude: longitude || DEFAULT_CENTER.longitude,
    latitude: latitude || DEFAULT_CENTER.latitude,
    zoom: 15,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null,
  );

  // Fly to new location when props change
  useEffect(() => {
    if (latitude && longitude) {
      setMarker({ lat: latitude, lng: longitude });

      // Use flyTo for smooth animation
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: [longitude, latitude],
          zoom: 16,
          duration: 1500,
          essential: true,
        });
      }
    }
  }, [latitude, longitude]);

  const handleMapClick = useCallback(
    (event: any) => {
      if (!interactive) return;

      const { lngLat } = event;
      const lat = lngLat.lat;
      const lng = lngLat.lng;

      setMarker({ lat, lng });
      onLocationSelect?.({ lat, lng });
    },
    [interactive, onLocationSelect],
  );

  const handleMarkerDrag = useCallback(
    (event: any) => {
      if (!interactive) return;

      const { lngLat } = event;
      const lat = lngLat.lat;
      const lng = lngLat.lng;

      setMarker({ lat, lng });
      onLocationSelect?.({ lat, lng });
    },
    [interactive, onLocationSelect],
  );

  return (
    <div
      style={{
        height,
        width: "100%",
        position: "relative",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      <MapGL
        ref={mapRef}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={maplibregl}
        style={{ width: "100%", height: "100%" }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        cursor={interactive ? "crosshair" : "default"}
        interactive={interactive}
      >
        <NavigationControl position="top-right" />
        {interactive && <GeolocateControl position="top-right" />}

        {marker && (
          <Marker
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
            draggable={interactive}
            onDragEnd={handleMarkerDrag}
          >
            <div className="text-red-600 drop-shadow-2xl filter animate-bounce">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-10 h-10"
              >
                <path
                  fillRule="evenodd"
                  d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </Marker>
        )}
      </MapGL>
    </div>
  );
}

export { Map };
export default Map;
