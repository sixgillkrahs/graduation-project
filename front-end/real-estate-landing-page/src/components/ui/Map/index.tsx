"use client";

import { useEffect, useState } from "react";
import MapGL, {
  Marker,
  NavigationControl,
  GeolocateControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (location: { lat: number; lng: number }) => void;
}

function Map({ latitude, longitude, onLocationSelect }: MapProps) {
  // Default to Ho Chi Minh City
  const [viewState, setViewState] = useState({
    longitude: longitude || 106.660172,
    latitude: latitude || 10.762622,
    zoom: 13,
  });

  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null
  );

  // Sync state if props change (controlled mode)
  useEffect(() => {
    if (latitude && longitude) {
      setViewState((prev) => ({
        ...prev,
        latitude,
        longitude,
        // Don't auto-zoom on every prop change to avoid annoying jumps, unless it's way off
      }));
      setMarker({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    const lat = lngLat.lat;
    const lng = lngLat.lng;

    setMarker({ lat, lng });

    if (onLocationSelect) {
      onLocationSelect({ lat, lng });
    }
  };

  return (
    <div
      style={{
        height: "400px",
        width: "100%",
        position: "relative",
        borderRadius: "0.75rem",
        overflow: "hidden",
      }}
    >
      <MapGL
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        mapLib={maplibregl}
        style={{ width: "100%", height: "100%" }}
        // Use CartoDB Voyager style for a nice, clean, free vector map
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onClick={handleMapClick}
        cursor="crosshair"
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {marker && (
          <Marker longitude={marker.lng} latitude={marker.lat} anchor="bottom">
            <div className="text-red-600 drop-shadow-2xl filter">
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
