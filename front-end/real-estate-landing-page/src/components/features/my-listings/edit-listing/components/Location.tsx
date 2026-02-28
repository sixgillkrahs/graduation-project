import { CsButton } from "@/components/custom";
import { Map } from "@/components/ui/Map";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import { nextStep, prevStep } from "@/store/listing.store";
import { ArrowLeft, ArrowRight, MapPin, Search, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";
import { findOptionValue } from "gra-helper";

interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    name?: string;
    street?: string;
    housenumber?: string;
    city?: string;
    district?: string;
    state?: string;
    country?: string;
    suburb?: string;
    quarter?: string;
    postcode?: string;
  };
}

const Location = () => {
  const dispatch = useDispatch();
  const { control, setValue, trigger, getValues } =
    useFormContext<ListingFormData>();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PhotonFeature[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleContinue = async () => {
    const isValid = await trigger(PropertyService.stepFields.step2);
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  console.log(getValues());

  // Photon API search
  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      // Bias search towards Vietnam
      const response = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5&lat=10.762622&lon=106.660172&lang=en`,
      );
      const data = await response.json();

      if (data.features) {
        // Filter to prioritize Vietnam results
        const vnResults = data.features.filter(
          (f: PhotonFeature) =>
            f.properties.country === "Vietnam" ||
            f.properties.country === "Việt Nam",
        );
        setSearchResults(
          vnResults.length > 0 ? vnResults : data.features.slice(0, 5),
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    setShowResults(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchLocation(query);
    }, 300);
  };

  const formatResultAddress = (props: PhotonFeature["properties"]) => {
    const parts = [
      props.name,
      props.street && props.housenumber
        ? `${props.housenumber} ${props.street}`
        : props.street,
      props.suburb || props.quarter,
      props.district,
      props.city || props.state,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const handleSelectResult = (feature: PhotonFeature) => {
    const [lng, lat] = feature.geometry.coordinates;
    const props = feature.properties;

    // Set coordinates
    setValue("latitude", lat);
    setValue("longitude", lng);
    // Build address string
    const addressParts = [
      props.housenumber,
      props.street,
      props.name !== props.street ? props.name : null,
    ].filter(Boolean);
    setValue("address", addressParts.join(" ") || formatResultAddress(props));

    // Smart match Province
    const cityOrState = props.city || props.state;
    const provinceValue = findOptionValue(
      cityOrState,
      PropertyService.Provinces,
    );
    if (provinceValue) setValue("province", provinceValue);

    // Smart match Ward
    // API often returns ward in 'suburb', 'quarter', or 'locality'
    const wardText = props.suburb || props.quarter;
    const wardValue = findOptionValue(wardText, PropertyService.Wards);
    if (wardValue) setValue("ward", wardValue);

    // Clear search
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-w-[700px]">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MapPin className="w-6 h-6" /> Step 2: Location
        </h2>

        <div className="space-y-6">
          {/* Search Box */}
          <div className="relative">
            <label className="cs-paragraph-black text-[16px] font-semibold mb-2 block">
              Search Location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                placeholder="Search for your property address..."
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Search to quickly set the pin and address, then verify the
              administrative details below.
            </p>

            {/* Search Results Dropdown */}
            {showResults && (searchResults.length > 0 || isSearching) && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-black rounded-full animate-spin mr-2" />
                    Searching...
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((feature, idx) => (
                      <li
                        key={idx}
                        onClick={() => handleSelectResult(feature)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {feature.properties.name ||
                                feature.properties.street ||
                                "Unknown"}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {formatResultAddress(feature.properties)}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Map Picker */}
          <div>
            <label className="cs-paragraph-black text-[16px] font-semibold mb-2 block">
              Pin Location on Map
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Click or drag the marker to set the exact location.
            </p>
            <div className="rounded-xl overflow-hidden border border-gray-200">
              <Controller
                name="latitude"
                control={control}
                render={({ field: { value: lat } }) => (
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field: { value: lng } }) => (
                      <Map
                        latitude={lat}
                        longitude={lng}
                        onLocationSelect={({ lat, lng }) => {
                          setValue("latitude", lat);
                          setValue("longitude", lng);
                          fetch(
                            `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}&lang=en`,
                          )
                            .then((res) => res.json())
                            .then((data) => {
                              if (data.features && data.features.length > 0) {
                                const feature = data.features[0];
                                const props = feature.properties;
                                console.log(props);

                                // Update address text
                                const addressParts = [
                                  props.housenumber,
                                  props.street,
                                  props.name !== props.street
                                    ? props.name
                                    : null,
                                ].filter(Boolean);

                                const formattedAddress =
                                  addressParts.join(" ") ||
                                  formatResultAddress(props);
                                // Smart Match Helper
                                const findOptionValue = (
                                  text: string | undefined,
                                  options: { label: string; value: string }[],
                                ) => {
                                  if (!text) return "";
                                  const lowerText = text.toLowerCase();
                                  const match = options.find(
                                    (opt) =>
                                      opt.value.toLowerCase() === lowerText ||
                                      opt.label.toLowerCase() === lowerText ||
                                      opt.label
                                        .toLowerCase()
                                        .includes(lowerText) ||
                                      lowerText.includes(
                                        opt.label.toLowerCase(),
                                      ) ||
                                      opt.value
                                        .toLowerCase()
                                        .includes(lowerText),
                                  );
                                  return match ? match.value : "";
                                };

                                // Smart match Province
                                const cityOrState = props.city || props.state;
                                const provinceValue = findOptionValue(
                                  cityOrState,
                                  PropertyService.Provinces,
                                );
                                if (provinceValue)
                                  setValue("province", provinceValue);

                                // Smart match Ward
                                const wardText =
                                  props.district ||
                                  props.quarter ||
                                  props.suburb ||
                                  props.locality;
                                const wardValue = findOptionValue(
                                  wardText,
                                  PropertyService.Wards,
                                );
                                if (wardValue) setValue("ward", wardValue);

                                setValue("address", formattedAddress);
                              }
                            })
                            .catch((err) =>
                              console.error("Reverse geocode error:", err),
                            );
                        }}
                      />
                    )}
                  />
                )}
              />
            </div>
          </div>

          {/* Administrative Selection */}
          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="province"
              control={control}
              rules={{ required: "Province is required" }}
              render={({ field: { value }, fieldState: { error } }) => (
                <CsSelect
                  label="Province / City"
                  onChange={undefined}
                  placeholder="Select Province"
                  options={PropertyService.Provinces}
                  value={value}
                  onOpenChange={undefined}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="ward"
              control={control}
              rules={{ required: "Ward is required" }}
              render={({ field: { value }, fieldState: { error } }) => (
                <CsSelect
                  label="Ward"
                  placeholder="Ward"
                  options={PropertyService.Wards}
                  value={value}
                  onChange={undefined}
                  onOpenChange={undefined}
                  error={error?.message}
                />
              )}
            />
          </div>

          {/* Street Address */}
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <Input
                label="Street Address"
                placeholder="Ex: 208 Nguyen Huu Canh"
                {...field}
              />
            )}
          />
        </div>

        <div className="flex justify-between pt-10">
          <CsButton onClick={onBack} icon={<ArrowLeft />} type="button">
            Back
          </CsButton>
          <div className="flex gap-4">
            <CsButton onClick={() => {}} type="button">
              Save Draft
            </CsButton>
            <CsButton onClick={handleContinue} type="button">
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
