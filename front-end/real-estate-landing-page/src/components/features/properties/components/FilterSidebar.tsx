import CsToggleGroup from "@/components/custom/toggle-group";
import { CsSelect } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { FilterX } from "lucide-react";
import { useState } from "react";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";

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

const FilterSidebar = () => {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <aside className="w-full lg:w-1/4 min-w-[280px] bg-white rounded-xl border border-gray-100 p-6 sticky top-24 h-fit shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <FilterX className="w-5 h-5 text-emerald-600" />
          Filters
        </h2>
        <button
          onClick={() => setSelectedAmenities([])}
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
            items={[
              { value: "any", label: "Any" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4+", label: "4+" },
            ]}
            className="flex flex-wrap gap-2 w-full justify-start"
            classNameItem="flex-1 min-w-[3rem] text-sm data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:border-emerald-600 hover:border-emerald-200 transition-all font-medium py-2"
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
            items={[
              { value: "any", label: "Any" },
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3+", label: "3+" },
            ]}
            className="flex flex-wrap gap-2 w-full justify-start"
            classNameItem="flex-1 min-w-[3rem] text-sm data-[state=on]:bg-emerald-600 data-[state=on]:text-white data-[state=on]:border-emerald-600 hover:border-emerald-200 transition-all font-medium py-2"
          />
        </div>

        {/* Direction Section */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Property Direction
          </h3>
          <CsSelect
            placeholder="Select Direction"
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
                <Checkbox
                  id={amenity.id}
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  // label={amenity.label}
                  className="w-full"
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
