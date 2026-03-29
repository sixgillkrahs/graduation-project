"use client";

import { Input } from "@/components/ui/input";
import {
  type GeocodedLocation,
  searchLocations,
} from "@/lib/location/client";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelectLocation?: (location: GeocodedLocation | null) => void;
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  onSelectLocation,
  placeholder = "Search City, District, or Project...",
  className,
}: LocationAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<GeocodedLocation[]>([]);
  const [displayText, setDisplayText] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDisplayText(value);
  }, [value]);

  useEffect(() => {
    const query = displayText.trim();

    if (query.length < 3) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    let isMounted = true;
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);

      try {
        const results = await searchLocations(query);

        if (!isMounted) {
          return;
        }

        setSuggestions(results);
      } catch (error) {
        if (isMounted) {
          setSuggestions([]);
        }
        console.error("Location autocomplete search failed:", error);
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [displayText]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayText(val);
    onChange(val);
    onSelectLocation?.(null);
    setIsOpen(true);
  };

  const handleSuggestionClick = (suggestion: GeocodedLocation) => {
    setDisplayText(suggestion.displayAddress);
    onChange(suggestion.displayAddress);
    onSelectLocation?.(suggestion);
    setSuggestions([]);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        ref={inputRef}
        placeholder={placeholder}
        preIcon={<MapPin className="w-5 h-5 main-color-red" />}
        className={cn(
          "border-none shadow-none bg-transparent h-12 text-base placeholder:text-gray-400 focus-visible:ring-0 px-0 md:px-4 pl-10!",
          className,
        )}
        value={displayText}
        onChange={handleInputChange}
        onFocus={() => {
          if (displayText.trim().length >= 3) {
            setIsOpen(true);
          }
        }}
        autoComplete="off"
      />

      {isOpen && (suggestions.length > 0 || isSearching) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500">Searching...</div>
          ) : (
            suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.latitude}-${suggestion.longitude}-${index}`}
                type="button"
                className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {suggestion.displayAddress}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
