import { CsCheckbox } from "@/components/custom";
import CsToggleGroup from "@/components/custom/toggle-group";
import { CsSelect } from "@/components/ui/select";
import { FilterX } from "lucide-react";
import { useState } from "react";

const AMENITIES = [
  { id: "pool", label: "Swimming Pool" },
  { id: "gym", label: "Gym & Fitness" },
  { id: "parking", label: "Car Parking" },
  { id: "elevator", label: "Elevator" },
  { id: "balcony", label: "Balcony/Terrace" },
  { id: "garden", label: "Garden" },
  { id: "security", label: "24/7 Security" },
  { id: "furnished", label: "Fully Furnished" },
];

export interface FilterValues {
  "features.bedrooms"?: number;
  "features.bathrooms"?: number;
  "features.direction"?: string;
  [key: string]: any;
}

interface FilterSidebarProps {
  onReset?: () => void;
  onFilterChange?: (filters: FilterValues) => void;
}

const DIRECTION_MAP: Record<string, string> = {
  north: "NORTH",
  south: "SOUTH",
  east: "EAST",
  west: "WEST",
  northeast: "NORTH_EAST",
  northwest: "NORTH_WEST",
  southeast: "SOUTH_EAST",
  southwest: "SOUTH_WEST",
};

const INITIAL_STATE = {
  bedrooms: "any",
  bathrooms: "any",
  direction: "",
  amenities: [] as string[],
};

const buildFilters = (
  bedrooms: string,
  bathrooms: string,
  direction: string,
): FilterValues => {
  const filters: FilterValues = {};

  if (bedrooms && bedrooms !== "any") {
    if (bedrooms === "4+") {
      filters["minBedrooms"] = 4;
    } else {
      filters["features.bedrooms"] = Number(bedrooms);
    }
  }

  if (bathrooms && bathrooms !== "any") {
    if (bathrooms === "3+") {
      filters["minBathrooms"] = 3;
    } else {
      filters["features.bathrooms"] = Number(bathrooms);
    }
  }

  if (direction && DIRECTION_MAP[direction]) {
    filters["features.direction"] = DIRECTION_MAP[direction];
  }

  return filters;
};

const FilterSidebar = ({ onReset, onFilterChange }: FilterSidebarProps) => {
  const [bedrooms, setBedrooms] = useState(INITIAL_STATE.bedrooms);
  const [bathrooms, setBathrooms] = useState(INITIAL_STATE.bathrooms);
  const [direction, setDirection] = useState(INITIAL_STATE.direction);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    INITIAL_STATE.amenities,
  );
  // Radix Select can't clear value to undefined, so we force remount with a key
  const [resetKey, setResetKey] = useState(0);

  const emitFilterChange = (
    newBedrooms: string,
    newBathrooms: string,
    newDirection: string,
  ) => {
    const filters = buildFilters(newBedrooms, newBathrooms, newDirection);
    onFilterChange?.(filters);
  };

  const handleBedroomChange = (val: string) => {
    if (!val) return;
    setBedrooms(val);
    emitFilterChange(val, bathrooms, direction);
  };

  const handleBathroomChange = (val: string) => {
    if (!val) return;
    setBathrooms(val);
    emitFilterChange(bedrooms, val, direction);
  };

  const handleDirectionChange = (val: string) => {
    setDirection(val);
    emitFilterChange(bedrooms, bathrooms, val);
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleResetAll = () => {
    setBedrooms(INITIAL_STATE.bedrooms);
    setBathrooms(INITIAL_STATE.bathrooms);
    setDirection(INITIAL_STATE.direction);
    setSelectedAmenities(INITIAL_STATE.amenities);
    setResetKey((prev) => prev + 1);
    onReset?.();
  };

  return (
    <aside className="w-full lg:w-1/4 min-w-[280px] bg-white rounded-xl border border-gray-100 p-6 sticky top-24 h-fit shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FilterX className="w-5 h-5 main-color-red" />
          Filters
        </h2>
        <button
          onClick={handleResetAll}
          className="text-sm font-medium text-red-500 hover:text-red-600 hover:underline transition-colors"
        >
          Reset All
        </button>
      </div>

      <div className="space-y-8">
        {/* Bedrooms Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Bedrooms
          </h3>
          <CsToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={bedrooms}
            onValueChange={handleBedroomChange}
            items={[
              { value: "any", label: "Any" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4+", label: "4+" },
            ]}
            className="flex flex-wrap gap-2 w-full justify-start"
            classNameItem="flex-1 min-w-[3rem] text-sm data-[state=on]:bg-red-500 data-[state=on]:text-white! data-[state=on]:border-red-500 hover:border-red-200 transition-all font-medium py-2"
          />
        </div>

        {/* Bathrooms Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Bathrooms
          </h3>
          <CsToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={bathrooms}
            onValueChange={handleBathroomChange}
            items={[
              { value: "any", label: "Any" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3+", label: "3+" },
            ]}
            className="flex flex-wrap gap-2 w-full justify-start"
            classNameItem="flex-1 min-w-[3rem] text-sm data-[state=on]:bg-red-500 data-[state=on]:text-white! data-[state=on]:border-red-500 hover:border-red-200 transition-all font-medium py-2"
          />
        </div>

        {/* Direction Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Property Direction
          </h3>
          <CsSelect
            key={resetKey}
            placeholder="Select Direction"
            value={direction || undefined}
            onChange={handleDirectionChange}
            options={[
              { value: "north", label: "North" },
              { value: "south", label: "South" },
              { value: "east", label: "East" },
              { value: "west", label: "West" },
              { value: "northeast", label: "North East" },
              { value: "northwest", label: "North West" },
              { value: "southeast", label: "South East" },
              { value: "southwest", label: "South West" },
            ]}
            className="w-full"
          />
        </div>

        {/* Amenities Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Amenities
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {AMENITIES.map((amenity) => (
              <div key={amenity.id} className="flex items-center">
                <CsCheckbox
                  label={amenity.label}
                  checked={selectedAmenities.includes(amenity.id)}
                  onCheckedChange={() => toggleAmenity(amenity.id)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;
