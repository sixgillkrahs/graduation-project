import { Icon } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/Select";
import { RootState } from "@/store";
import { prevStep, submitStep2 } from "@/store/listing.store";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { Map } from "@/components/ui/Map";
import { CsButton } from "@/components/custom";

const Location = () => {
  const dispatch = useDispatch();
  const listingData = useSelector((state: RootState) => state.listing.data);
  const locationData = listingData.location || {};

  const { control, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      province: locationData.province || "",
      district: locationData.district || "",
      ward: locationData.ward || "",
      address: locationData.address || "",
      latitude: locationData.latitude || null,
      longitude: locationData.longitude || null,
    },
  });

  const formValues = watch();
  const [searchString, setSearchString] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onSubmit = (data: any) => {
    dispatch(submitStep2({ location: data }));
  };

  const onBack = () => {
    dispatch(prevStep());
  };

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Fetch Provinces
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => res.json())
      .then((data) => {
        const options = data.map((p: any) => ({
          label: p.name,
          value: p.code,
        }));
        setProvinces(options);
      });
  }, []);

  const selectedProvince = watch("province");
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          if (data.districts) {
            setDistricts(
              data.districts.map((d: any) => ({
                label: d.name,
                value: d.code,
              })),
            );
          }
        });
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  const selectedDistrict = watch("district");
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          if (data.wards) {
            setWards(
              data.wards.map((w: any) => ({ label: w.name, value: w.code })),
            );
          }
        });
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Icon.MapPin className="w-6 h-6" /> Step 2: Location
        </h2>

        <form className="space-y-6">
          <div className="grid grid-cols-3 gap-6">
            <Controller
              name="province"
              control={control}
              render={({ field }) => (
                <Select
                  label="Province / City"
                  placeholder="Select Province"
                  options={provinces}
                  value={field.value}
                  onChange={(opt) => {
                    field.onChange(opt);
                    setValue("district", ""); // Reset child
                    setValue("ward", "");
                  }}
                />
              )}
            />
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <Select
                  label="District"
                  placeholder="Select District"
                  options={districts}
                  value={field.value}
                  onChange={(opt) => {
                    field.onChange(opt);
                    setValue("ward", ""); // Reset child
                  }}
                />
              )}
            />
            <Controller
              name="ward"
              control={control}
              render={({ field }) => (
                <Select
                  label="Ward"
                  placeholder="Select Ward"
                  options={wards}
                  value={field.value}
                  onChange={(opt) => field.onChange(opt)}
                />
              )}
            />
          </div>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <div className="relative">
                <Input
                  label="Street Address"
                  placeholder="Ex: 208 Nguyen Huu Canh"
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    const val = e.target.value;
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);

                    if (!val || val.length < 5) {
                      setSuggestions([]);
                      return;
                    }

                    timeoutRef.current = setTimeout(() => {
                      // Helper to find label by value
                      const getLabel = (options: any[], value: any) =>
                        options?.find((opt) => opt.value === value)?.label ||
                        "";

                      // Get names instead of codes
                      const pName = getLabel(provinces, formValues.province);
                      const dName = getLabel(districts, formValues.district);
                      const wName = getLabel(wards, formValues.ward);

                      // Combine address with province/district names
                      const fullQuery = [val, wName, dName, pName]
                        .filter(Boolean)
                        .join(", ");

                      fetch(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                          fullQuery,
                        )}&format=json&addressdetails=1&limit=5&countrycodes=vn`,
                      )
                        .then((res) => res.json())
                        .then((data) => {
                          if (Array.isArray(data)) {
                            setSuggestions(data);
                          } else {
                            setSuggestions([]);
                          }
                        })
                        .catch(() => setSuggestions([]));
                    }, 500);
                  }}
                  onBlur={() => {
                    // Small delay to allow clicking on suggestion
                    setTimeout(() => setSuggestions([]), 200);
                  }}
                />
                {suggestions.length > 0 && (
                  <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-auto">
                    {suggestions.map((s, idx) => (
                      <li
                        key={idx}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm flex flex-col"
                        onClick={() => {
                          field.onChange(s.display_name); // Update visible address
                          setValue("latitude", parseFloat(s.lat));
                          setValue("longitude", parseFloat(s.lon));
                          setSuggestions([]);
                        }}
                      >
                        <span className="font-medium text-gray-900">
                          {s.display_name.split(",")[0]}
                        </span>
                        <span className="text-gray-500 text-xs truncate">
                          {s.display_name}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          />

          {/* Map Picker */}
          <div className="mt-4">
            <label className="cs-paragraph-black text-[16px] font-semibold mb-2 block">
              Pin Location on Map
            </label>
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
                        }}
                      />
                    )}
                  />
                )}
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex justify-between pt-10">
        <CsButton
          onClick={onBack}
          icon={<Icon.ArrowLeft />}
          className="text-black"
          type="button"
        >
          Back
        </CsButton>
        <div className="flex gap-4">
          <CsButton
            onClick={() => {}}
            type="button"
            variant="secondary"
            className="bg-gray-100 text-gray-700"
          >
            Save Draft
          </CsButton>
          <CsButton
            className="cs-bg-black hover:bg-black/90 text-white px-8 py-3 rounded-full font-semibold shadow-lg shadow-gray-200"
            onClick={handleSubmit(onSubmit)}
            type="submit"
          >
            Continue
            <Icon.ArrowRight className="w-5 h-5 ml-2" />
          </CsButton>
        </div>
      </div>
    </div>
  );
};

export default Location;
