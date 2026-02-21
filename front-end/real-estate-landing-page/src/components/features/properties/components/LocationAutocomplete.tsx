"use client";

import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { LIST_PROVINCE, LIST_WARD } from "gra-helper";
import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface LocationOption {
  label: string;
  value: string;
  type: "province" | "ward";
}

// Build the full suggestion list once
const ALL_LOCATIONS: LocationOption[] = [
  ...LIST_PROVINCE.map((p: { label: string; value: string }) => ({
    label: p.label,
    value: p.value,
    type: "province" as const,
  })),
  ...LIST_WARD.map((w: { label: string; value: string }) => ({
    label: w.label,
    value: w.value,
    type: "ward" as const,
  })),
];

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = "Search City, District, or Project...",
  className,
}: LocationAutocompleteProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationOption[]>([]);
  const [displayText, setDisplayText] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync displayText when value is cleared externally (e.g. reset)
  useEffect(() => {
    if (!value) setDisplayText("");
  }, [value]);

  // Filter suggestions based on input
  const filterSuggestions = useCallback((query: string) => {
    if (!query || query.length < 1) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = ALL_LOCATIONS.filter(
      (loc) =>
        loc.label.toLowerCase().includes(q) ||
        loc.value.toLowerCase().includes(q),
    ).slice(0, 8);

    setSuggestions(filtered);
  }, []);

  // Handle input change — user is typing freely
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDisplayText(val);
    onChange(val); // pass raw text as query
    filterSuggestions(val);
    setIsOpen(true);
  };

  // Handle suggestion click — show label, pass value
  const handleSuggestionClick = (suggestion: LocationOption) => {
    setDisplayText(suggestion.label); // display label in input
    onChange(suggestion.value); // pass value to form query
    setSuggestions([]);
    setIsOpen(false);
  };

  // Close dropdown on outside click
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

  const tLoc = useTranslations("PropertiesPage.location");

  const typeLabel = (type: string) => {
    switch (type) {
      case "province":
        return tLoc("province");
      case "ward":
        return tLoc("ward");
      default:
        return "";
    }
  };

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
          if (value && suggestions.length > 0) setIsOpen(true);
        }}
        autoComplete="off"
      />

      {/* Suggestions dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg animate-in fade-in-0 zoom-in-95">
          {suggestions.map((suggestion, index) => (
            <button
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              type="button"
              className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {suggestion.label}
                </p>
                <p className="text-xs text-gray-500">
                  {typeLabel(suggestion.type)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
