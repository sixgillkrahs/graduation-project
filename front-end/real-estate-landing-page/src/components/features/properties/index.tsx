"use client";

import { CsButton } from "@/components/custom";
import CsToggleGroup from "@/components/custom/toggle-group";
import { Input } from "@/components/ui/input";
import { CsSelect } from "@/components/ui/select";
import React from "react";

const Properties = () => {
  return (
    <section className="px-4 md:px-20 container mx-auto flex gap-4">
      <div className="min-w-[300px] grid space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="cs-typography text-2xl! font-bold!">Filter</h1>
          <span className="cs-typography-red text-sm! font-medium! cursor-pointer">
            Reset All
          </span>
        </div>
        <div>
          <CsToggleGroup
            type="single"
            variant="default"
            size="icon"
            label="Bedrooms"
            className="gap-4"
            classNameItem="size-10 border cs-outline-gray"
            items={[
              { value: "1", label: "1" },
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
              { value: "5+", label: "5+" },
            ]}
          />
        </div>
        <div>
          <CsSelect
            label="Direction"
            defaultValue="any"
            options={[
              { value: "any", label: "Any" },
              { value: "north", label: "North" },
              { value: "south", label: "South" },
              { value: "east", label: "East" },
              { value: "west", label: "West" },
            ]}
          />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>Showing 12 results in </div>
          <CsSelect
            label="Sort by:"
            defaultValue="newest"
            className="flex flex-row"
            options={[
              { value: "newest", label: "Newest" },
              { value: "oldest", label: "Oldest" },
              { value: "price-asc", label: "Price (Low to High)" },
              { value: "price-desc", label: "Price (High to Low)" },
            ]}
          />
        </div>
      </div>
    </section>
  );
};

export default Properties;
