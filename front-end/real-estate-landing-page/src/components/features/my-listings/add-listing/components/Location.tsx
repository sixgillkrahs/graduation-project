import { ArrowLeft, ArrowRight, MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { useDispatch } from "react-redux";
import { CsButton } from "@/components/custom";
import { useListingDraft } from "@/components/features/my-listings/components/ListingDraftContext";
import { Input } from "@/components/ui/input";
import { Map as ListingMap } from "@/components/ui/Map";
import { CsSelect } from "@/components/ui/select";
import {
  type AdministrativeUnitOption,
  type GeocodedLocation,
  getLocalUnitOptions,
  getProvinceOptions,
  reverseGeocode,
  searchLocations,
} from "@/lib/location/client";
import { nextStep, prevStep } from "@/store/listing.store";
import type { ListingFormData } from "../../dto/listingformdata.dto";
import PropertyService from "../../services/service";

const createFallbackOption = (value: string): AdministrativeUnitOption => ({
  label: value,
  value,
  code: -1,
  divisionType: "legacy",
  codename: "legacy",
});

const Location = () => {
  const dispatch = useDispatch();
  const { control, setValue, trigger, watch } =
    useFormContext<ListingFormData>();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodedLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { saveDraft, isSavingDraft } = useListingDraft();
  const [provinceOptions, setProvinceOptions] = useState<
    AdministrativeUnitOption[]
  >([]);
  const [localUnitOptions, setLocalUnitOptions] = useState<
    AdministrativeUnitOption[]
  >([]);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const provinceOptionsRef = useRef<AdministrativeUnitOption[]>([]);

  const selectedProvince = watch("province");
  const selectedLocalUnit = watch("ward");

  useEffect(() => {
    provinceOptionsRef.current = provinceOptions;
  }, [provinceOptions]);

  useEffect(() => {
    let isMounted = true;

    const loadProvinces = async () => {
      try {
        const results = await getProvinceOptions();
        if (!isMounted) {
          return;
        }

        setProvinceOptions(results);
        provinceOptionsRef.current = results;
      } catch (error) {
        console.error("Failed to load provinces:", error);
      }
    };

    void loadProvinces();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const provinceOption = provinceOptionsRef.current.find(
      (option) => option.value === selectedProvince,
    );

    if (!provinceOption || provinceOption.code <= 0) {
      setLocalUnitOptions([]);
      return;
    }

    let isMounted = true;

    const loadLocalUnits = async () => {
      try {
        const results = await getLocalUnitOptions(provinceOption.code);
        if (isMounted) {
          setLocalUnitOptions(results);
        }
      } catch (error) {
        console.error("Failed to load administrative units:", error);
      }
    };

    void loadLocalUnits();

    return () => {
      isMounted = false;
    };
  }, [selectedProvince]);

  const provinceSelectOptions = useMemo(() => {
    if (
      selectedProvince &&
      !provinceOptions.some((option) => option.value === selectedProvince)
    ) {
      return [...provinceOptions, createFallbackOption(selectedProvince)];
    }

    return provinceOptions;
  }, [provinceOptions, selectedProvince]);

  const localUnitSelectOptions = useMemo(() => {
    if (
      selectedLocalUnit &&
      !localUnitOptions.some((option) => option.value === selectedLocalUnit)
    ) {
      return [...localUnitOptions, createFallbackOption(selectedLocalUnit)];
    }

    return localUnitOptions;
  }, [localUnitOptions, selectedLocalUnit]);

  const handleContinue = async () => {
    const isValid = await trigger(PropertyService.stepFields.step2);
    if (isValid) {
      dispatch(nextStep());
    }
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  const searchLocation = useCallback(async (query: string) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchLocations(query);
      setSearchResults(results);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const preloadLocalUnits = useCallback(
    async (provinceValue: string, provinceCode?: number | null) => {
      const provinceOption =
        provinceOptionsRef.current.find(
          (option) => option.value === provinceValue,
        ) ||
        provinceOptionsRef.current.find(
          (option) => option.code === provinceCode,
        );

      const resolvedProvinceCode = provinceOption?.code || provinceCode;
      if (!resolvedProvinceCode || resolvedProvinceCode <= 0) {
        setLocalUnitOptions([]);
        return;
      }

      try {
        const results = await getLocalUnitOptions(resolvedProvinceCode);
        setLocalUnitOptions(results);
      } catch (error) {
        console.error("Failed to preload administrative units:", error);
      }
    },
    [],
  );

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    setShowResults(true);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      void searchLocation(query);
    }, 300);
  };

  const handleSelectResult = (result: GeocodedLocation) => {
    setValue("latitude", result.latitude);
    setValue("longitude", result.longitude);
    setValue("address", result.addressLine);

    if (result.provinceValue) {
      setValue("province", result.provinceValue);
      void preloadLocalUnits(result.provinceValue, result.provinceCode);
    }

    if (result.wardValue) {
      setValue("ward", result.wardValue);
    }

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
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-8 duration-500">
      <div className="min-w-[700px] rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
          <MapPin className="w-6 h-6" /> Step 2: Location
        </h2>

        <div className="space-y-6">
          <div className="relative">
            <label
              htmlFor="property-location-search"
              className="cs-paragraph-black mb-2 block text-[16px] font-semibold"
            >
              Search Location
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                id="property-location-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setShowResults(true)}
                placeholder="Search for your property address..."
                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-10 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Search to quickly set the pin and address, then verify the
              administrative details below.
            </p>

            {showResults && (searchResults.length > 0 || isSearching) && (
              <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                    Searching...
                  </div>
                ) : (
                  <ul>
                    {searchResults.map((feature) => (
                      <li
                        key={`${feature.latitude}-${feature.longitude}-${feature.addressLine}`}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectResult(feature)}
                          className="w-full p-3 text-left transition-colors hover:bg-gray-50"
                        >
                          <div className="flex items-start gap-3">
                            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-gray-900">
                                {feature.name}
                              </p>
                              <p className="truncate text-sm text-gray-500">
                                {feature.displayAddress}
                              </p>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="cs-paragraph-black mb-2 text-[16px] font-semibold">
              Pin Location on Map
            </p>
            <p className="mb-2 text-xs text-gray-500">
              Click or drag the marker to set the exact location.
            </p>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <Controller
                name="latitude"
                control={control}
                render={({ field: { value: lat } }) => (
                  <Controller
                    name="longitude"
                    control={control}
                    render={({ field: { value: lng } }) => (
                      <ListingMap
                        latitude={lat}
                        longitude={lng}
                        onLocationSelect={async ({ lat, lng }) => {
                          setValue("latitude", lat);
                          setValue("longitude", lng);

                          try {
                            const result = await reverseGeocode(lat, lng);
                            if (!result) {
                              return;
                            }

                            if (result.provinceValue) {
                              setValue("province", result.provinceValue);
                              await preloadLocalUnits(
                                result.provinceValue,
                                result.provinceCode,
                              );
                            }

                            if (result.wardValue) {
                              setValue("ward", result.wardValue);
                            }

                            setValue("address", result.addressLine);
                          } catch (error) {
                            console.error("Reverse geocode error:", error);
                          }
                        }}
                      />
                    )}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Controller
              name="province"
              control={control}
              rules={{ required: "Province is required" }}
              render={({ field, fieldState: { error } }) => (
                <CsSelect
                  label="Province / City"
                  name={field.name}
                  placeholder="Select province / city"
                  options={provinceSelectOptions}
                  value={field.value}
                  searchable
                  onChange={({ target }) => {
                    field.onChange(target.value);
                    setValue("ward", "");
                    setLocalUnitOptions([]);
                  }}
                  error={error?.message}
                />
              )}
            />
            <Controller
              name="ward"
              control={control}
              rules={{ required: "Ward is required" }}
              render={({ field, fieldState: { error } }) => (
                <CsSelect
                  label="Ward / Commune / Special Zone"
                  name={field.name}
                  placeholder={
                    selectedProvince
                      ? "Select administrative unit"
                      : "Select province first"
                  }
                  options={localUnitSelectOptions}
                  value={field.value}
                  disabled={!selectedProvince}
                  searchable
                  onChange={({ target }) => field.onChange(target.value)}
                  error={error?.message}
                />
              )}
            />
          </div>

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
            <CsButton onClick={saveDraft} type="button" loading={isSavingDraft}>
              Save Draft
            </CsButton>
            <CsButton onClick={handleContinue} type="button">
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </CsButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
