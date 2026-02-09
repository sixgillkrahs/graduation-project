"use client";

import { CsButton } from "@/components/custom";
import { CsSelect } from "@/components/ui/select";
import React from "react";
import AdvancedSearch from "./components/AdvancedSearch";
import FilterSidebar from "./components/FilterSidebar";
import PropertyCard, { PropertyCardProps } from "./components/PropertyCard";

const PROPERTIES_DATA: PropertyCardProps[] = [
  {
    id: "1",
    image: "https://placehold.co/600x300",
    title: "Luxury 2BR Apartment in Cau Giay",
    price: "5.2 Billion",
    unit: "Total",
    address: "Dich Vong, Cau Giay, Hanoi",
    specs: { beds: 2, baths: 2, area: 80 },
    badges: { aiRecommended: true, tour3D: true },
    agent: { name: "Agent Quan", avatar: "" },
    postedAt: "2 days ago",
  },
  {
    id: "2",
    image: "https://placehold.co/600x300",
    title: "Modern Villa with Private Pool",
    price: "15.5 Billion",
    unit: "Total",
    address: "Tay Ho, Hanoi",
    specs: { beds: 4, baths: 5, area: 250 },
    badges: { aiRecommended: true, tour3D: false },
    agent: { name: "Sarah Nguyen", avatar: "" },
    postedAt: "1 day ago",
  },
  {
    id: "3",
    image: "https://placehold.co/600x300",
    title: "Cozy Studio near Universities",
    price: "2.8 Billion",
    unit: "Total",
    address: "Dong Da, Hanoi",
    specs: { beds: 1, baths: 1, area: 45 },
    badges: { aiRecommended: false, tour3D: true },
    agent: { name: "Mike Tran", avatar: "" },
    postedAt: "5 hours ago",
  },
  {
    id: "4",
    image: "https://placehold.co/600x300",
    title: "Spacious Garden House",
    price: "8.5 Billion",
    unit: "Total",
    address: "Long Bien, Hanoi",
    specs: { beds: 3, baths: 2, area: 120 },
    badges: { aiRecommended: false, tour3D: false },
    agent: { name: "Agent Quan", avatar: "" },
    postedAt: "3 days ago",
  },
  {
    id: "5",
    image: "https://placehold.co/600x300",
    title: "Penthouse with City View",
    price: "22 Billion",
    unit: "Total",
    address: "Ba Dinh, Hanoi",
    specs: { beds: 3, baths: 3, area: 180 },
    badges: { aiRecommended: true, tour3D: true },
    agent: { name: "Lisa Pham", avatar: "" },
    postedAt: "Just now",
  },
  {
    id: "6",
    image: "https://placehold.co/600x300",
    title: "Affordable Family Home",
    price: "4.1 Billion",
    unit: "Total",
    address: "Ha Dong, Hanoi",
    specs: { beds: 3, baths: 2, area: 95 },
    badges: { aiRecommended: false, tour3D: false },
    agent: { name: "David Le", avatar: "" },
    postedAt: "1 week ago",
  },
];

const Properties = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Advanced Search Bar (Sticky) */}
      <AdvancedSearch />

      <main className="container mx-auto px-4 md:px-20 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar */}
          <FilterSidebar />

          {/* Right Content */}
          <div className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Properties for Sale in Hanoi
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Showing 1-6 of 124 results
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-gray-500 text-sm font-medium">
                  Sort by:
                </span>
                <div className="w-48">
                  <CsSelect
                    placeholder="Sort"
                    defaultValue="newest"
                    options={[
                      { value: "newest", label: "Newest" },
                      { value: "price_asc", label: "Price: Low to High" },
                      { value: "price_desc", label: "Price: High to Low" },
                    ]}
                    className="border-gray-200 h-10 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {PROPERTIES_DATA.map((prop) => (
                <PropertyCard key={prop.id} {...prop} />
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center gap-2">
              <CsButton
                variant="outline"
                className="w-10 h-10 p-0 rounded-lg shadow-sm border-emerald-600 text-emerald-600 font-bold bg-emerald-50"
              >
                1
              </CsButton>
              <CsButton
                variant="ghost"
                className="w-10 h-10 p-0 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                2
              </CsButton>
              <CsButton
                variant="ghost"
                className="w-10 h-10 p-0 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                3
              </CsButton>
              <span className="flex items-end px-2 text-gray-400 pb-2">
                ...
              </span>
              <CsButton
                variant="ghost"
                className="w-10 h-10 p-0 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                10
              </CsButton>
              <CsButton
                variant="outline"
                className="px-4 h-10 rounded-lg text-gray-600 border-gray-200 hover:border-emerald-600 hover:text-emerald-600"
              >
                Next
              </CsButton>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Properties;
