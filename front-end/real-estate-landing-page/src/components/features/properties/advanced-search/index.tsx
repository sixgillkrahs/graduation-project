"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { findOptionLabel, LIST_PROVINCE, LIST_WARD } from "gra-helper";
import {
  AlertCircle,
  ArrowLeft,
  Grid3X3,
  House,
  MapPinned,
  RefreshCwIcon,
  Search,
} from "lucide-react";
import type { IParamsPagination } from "@/@types/service";
import { CsButton, CsPagination } from "@/components/custom";
import { ROUTES } from "@/const/routes";
import StateSurface from "@/components/ui/state-surface";
import { CsSelect } from "@/components/ui/select";
import { formatPropertyPostedDate } from "@/lib/property-date";
import type { GeocodedLocation } from "@/lib/location/client";
import { mapPropertyToCompareItem } from "../compare/compare.utils";
import LocationAutocomplete from "../components/LocationAutocomplete";
import PropertyCard from "../components/PropertyCard";
import PropertyCardSkeleton from "../components/PropertyCardSkeleton";
import { useOnSale } from "../services/query";
import type { PropertyDto } from "../dto/property.dto";

const PropertyResultsMap = dynamic(() => import("./PropertyResultsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[420px] animate-pulse rounded-[28px] border border-stone-200 bg-stone-100" />
  ),
});

type SearchFormState = {
  query: string;
  demandType: string;
  propertyType: string;
  priceRange: string;
  bedrooms: string;
  latitude: number | null;
  longitude: number | null;
  radiusKm: number;
};

const RESULTS_PER_PAGE = 6;

const DEFAULT_PARAMS: IParamsPagination = {
  page: 1,
  limit: RESULTS_PER_PAGE,
};

const DEFAULT_RADIUS_KM = 20;

const DEFAULT_FORM_STATE: SearchFormState = {
  query: "",
  demandType: "all",
  propertyType: "all",
  priceRange: "all",
  bedrooms: "any",
  latitude: null,
  longitude: null,
  radiusKm: DEFAULT_RADIUS_KM,
};

type ParsedAdvancedSearchState = {
  params: IParamsPagination;
  locationLabel: string;
};

const normalizeParamsFromSearch = (searchParams: URLSearchParams) => {
  const parsedPage = Number(searchParams.get("page"));
  const params: IParamsPagination = {
    page:
      Number.isFinite(parsedPage) && parsedPage > 0
        ? parsedPage
        : DEFAULT_PARAMS.page,
    limit: DEFAULT_PARAMS.limit,
  };

  const query = searchParams.get("query");
  const demandType = searchParams.get("demandType");
  const propertyType = searchParams.get("propertyType");
  const maxPrice = searchParams.get("maxPrice");
  const sortField = searchParams.get("sortField");
  const sortOrder = searchParams.get("sortOrder");
  const exactBedrooms = searchParams.get("features.bedrooms");
  const minBedrooms = searchParams.get("minBedrooms");
  const latitude = searchParams.get("latitude");
  const longitude = searchParams.get("longitude");
  const radiusKm = searchParams.get("radiusKm");
  const locationLabel = searchParams.get("locationLabel");

  if (query) params.query = query;
  if (demandType && demandType !== "all") params.demandType = demandType;
  if (propertyType && propertyType !== "all")
    params.propertyType = propertyType;
  if (maxPrice) params.maxPrice = Number(maxPrice);
  if (sortField) params.sortField = sortField;
  if (sortOrder === "asc" || sortOrder === "desc") params.sortOrder = sortOrder;
  if (exactBedrooms) params["features.bedrooms"] = Number(exactBedrooms);
  if (minBedrooms) params.minBedrooms = Number(minBedrooms);
  if (latitude && longitude) {
    const parsedLatitude = Number(latitude);
    const parsedLongitude = Number(longitude);
    const parsedRadiusKm = Number(radiusKm);

    if (
      Number.isFinite(parsedLatitude) &&
      Number.isFinite(parsedLongitude) &&
      Math.abs(parsedLatitude) <= 90 &&
      Math.abs(parsedLongitude) <= 180
    ) {
      params.latitude = parsedLatitude;
      params.longitude = parsedLongitude;
      params.radiusKm =
        Number.isFinite(parsedRadiusKm) && parsedRadiusKm > 0
          ? parsedRadiusKm
          : DEFAULT_RADIUS_KM;
      delete params.query;
    }
  }

  return {
    params,
    locationLabel:
      locationLabel || (typeof params.query === "string" ? params.query : ""),
  } satisfies ParsedAdvancedSearchState;
};

const buildSearchString = (
  params: IParamsPagination,
  locationLabel?: string,
) => {
  const nextParams = new URLSearchParams();

  if (params.page !== DEFAULT_PARAMS.page) {
    nextParams.set("page", String(params.page));
  }

  if (params.limit !== DEFAULT_PARAMS.limit) {
    nextParams.set("limit", String(params.limit));
  }

  if (typeof params.query === "string" && params.query.trim()) {
    nextParams.set("query", params.query.trim());
  }

  if (
    typeof params.demandType === "string" &&
    params.demandType.trim() &&
    params.demandType !== "all"
  ) {
    nextParams.set("demandType", params.demandType);
  }

  if (
    typeof params.propertyType === "string" &&
    params.propertyType.trim() &&
    params.propertyType !== "all"
  ) {
    nextParams.set("propertyType", params.propertyType);
  }

  if (typeof params.maxPrice === "number") {
    nextParams.set("maxPrice", String(params.maxPrice));
  }

  if (typeof params.sortField === "string" && params.sortField.trim()) {
    nextParams.set("sortField", String(params.sortField));
  }

  if (
    typeof params.sortOrder === "string" &&
    ["asc", "desc"].includes(params.sortOrder)
  ) {
    nextParams.set("sortOrder", String(params.sortOrder));
  }

  if (typeof params["features.bedrooms"] === "number") {
    nextParams.set("features.bedrooms", String(params["features.bedrooms"]));
  }

  if (typeof params.minBedrooms === "number") {
    nextParams.set("minBedrooms", String(params.minBedrooms));
  }

  if (typeof params.latitude === "number") {
    nextParams.set("latitude", String(params.latitude));
  }

  if (typeof params.longitude === "number") {
    nextParams.set("longitude", String(params.longitude));
  }

  if (typeof params.radiusKm === "number") {
    nextParams.set("radiusKm", String(params.radiusKm));
  }

  if (
    typeof params.latitude === "number" &&
    typeof params.longitude === "number" &&
    locationLabel?.trim()
  ) {
    nextParams.set("locationLabel", locationLabel.trim());
  }

  return nextParams.toString();
};

const getFormStateFromParams = (
  params: IParamsPagination,
  locationLabel: string,
): SearchFormState => ({
  query: locationLabel,
  demandType: typeof params.demandType === "string" ? params.demandType : "all",
  propertyType:
    typeof params.propertyType === "string" ? params.propertyType : "all",
  priceRange:
    typeof params.maxPrice === "number" ? String(params.maxPrice) : "all",
  bedrooms:
    typeof params.minBedrooms === "number" && params.minBedrooms >= 4
      ? "4+"
      : typeof params["features.bedrooms"] === "number"
        ? String(params["features.bedrooms"])
        : "any",
  latitude: typeof params.latitude === "number" ? params.latitude : null,
  longitude: typeof params.longitude === "number" ? params.longitude : null,
  radiusKm:
    typeof params.radiusKm === "number" && params.radiusKm > 0
      ? params.radiusKm
      : DEFAULT_RADIUS_KM,
});

const mapToMapItem = (
  property: PropertyDto & { isFavorite: boolean },
  locale: string,
) => {
  const latitude = property.location?.coordinates?.lat;
  const longitude = property.location?.coordinates?.long;

  if (
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
  ) {
    return null;
  }

  return {
    id: property._id,
    title: property.title,
    price: property.features?.price || 0,
    currency: property.features?.currency,
    unit: property.features?.priceUnit,
    type: (property.demandType?.toLowerCase() === "sale" ? "sale" : "rent") as
      | "sale"
      | "rent",
    latitude,
    longitude,
    address: `${property.location?.address}, ${findOptionLabel(property.location?.ward, LIST_WARD)}, ${findOptionLabel(property.location?.province, LIST_PROVINCE)}`,
    postedAt: formatPropertyPostedDate(property.createdAt, locale),
  };
};

const getSortValue = (params: IParamsPagination) =>
  params.sortField === "features.price"
    ? params.sortOrder === "asc"
      ? "price_asc"
      : "price_desc"
    : "newest";

const AdvancedPropertySearch = () => {
  const t = useTranslations("PropertiesPage.advancedSearch");
  const sharedT = useTranslations("PropertiesPage");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearchState = useMemo(
    () => normalizeParamsFromSearch(searchParams),
    [searchParams],
  );
  const [params, setParams] = useState<IParamsPagination>(
    initialSearchState.params,
  );
  const [formState, setFormState] = useState<SearchFormState>(
    getFormStateFromParams(
      initialSearchState.params,
      initialSearchState.locationLabel,
    ),
  );
  const [activePropertyId, setActivePropertyId] = useState<string | null>(null);

  const { data, isLoading, isFetching, isError, refetch } = useOnSale(params);
  const results = data?.data?.results || [];

  useEffect(() => {
    setParams(initialSearchState.params);
    setFormState(
      getFormStateFromParams(
        initialSearchState.params,
        initialSearchState.locationLabel,
      ),
    );
  }, [initialSearchState]);

  useEffect(() => {
    if (!results.length) {
      setActivePropertyId(null);
      return;
    }

    setActivePropertyId((current) =>
      current && results.some((item) => item._id === current)
        ? current
        : results[0]._id,
    );
  }, [results]);

  const propertyTypeOptions = useMemo(
    () => [
      { value: "all", label: t("filters.allTypes") },
      { value: "APARTMENT", label: sharedT("search.typeApartment") },
      { value: "HOUSE", label: sharedT("search.typeHouse") },
      { value: "STREET_HOUSE", label: sharedT("search.typeStreetHouse") },
      { value: "VILLA", label: sharedT("search.typeVilla") },
      { value: "LAND", label: sharedT("search.typeLand") },
      { value: "OTHER", label: sharedT("search.typeOther") },
    ],
    [sharedT, t],
  );

  const priceRangeOptions = useMemo(
    () => [
      { value: "all", label: t("filters.allPrices") },
      { value: "2", label: t("filters.maxPrice", { price: 2 }) },
      { value: "5", label: t("filters.maxPrice", { price: 5 }) },
      { value: "10", label: t("filters.maxPrice", { price: 10 }) },
      { value: "20", label: t("filters.maxPrice", { price: 20 }) },
    ],
    [t],
  );

  const bedroomOptions = useMemo(
    () => [
      { value: "any", label: t("filters.anyBedrooms") },
      { value: "1", label: t("filters.bedroomCount", { count: 1 }) },
      { value: "2", label: t("filters.bedroomCount", { count: 2 }) },
      { value: "3", label: t("filters.bedroomCount", { count: 3 }) },
      { value: "4+", label: t("filters.bedroomPlus") },
    ],
    [t],
  );

  const demandTypeOptions = useMemo(
    () => [
      { value: "all", label: sharedT("search.demandAll") },
      { value: "RENT", label: sharedT("search.demandRent") },
      { value: "SALE", label: sharedT("search.demandSale") },
    ],
    [sharedT],
  );

  const mapItems = useMemo(
    () =>
      results
        .map((item) => mapToMapItem(item, locale))
        .filter((item) => item !== null),
    [locale, results],
  );

  const sortOptions = useMemo(
    () => [
      { value: "newest", label: sharedT("sort.newest") },
      { value: "price_asc", label: sharedT("sort.priceLowHigh") },
      { value: "price_desc", label: sharedT("sort.priceHighLow") },
    ],
    [sharedT],
  );

  const handleSearch = () => {
    const nextParams: IParamsPagination = {
      page: 1,
      limit: params.limit || DEFAULT_PARAMS.limit,
    };

    if (typeof params.sortField === "string" && params.sortField.trim()) {
      nextParams.sortField = params.sortField;
    }

    if (
      typeof params.sortOrder === "string" &&
      ["asc", "desc"].includes(params.sortOrder)
    ) {
      nextParams.sortOrder = params.sortOrder;
    }

    if (
      formState.query.trim() &&
      typeof formState.latitude === "number" &&
      typeof formState.longitude === "number"
    ) {
      nextParams.latitude = formState.latitude;
      nextParams.longitude = formState.longitude;
      nextParams.radiusKm = formState.radiusKm || DEFAULT_RADIUS_KM;
    } else if (formState.query.trim()) {
      nextParams.query = formState.query.trim();
    }

    if (formState.propertyType !== "all") {
      nextParams.propertyType = formState.propertyType;
    }

    if (formState.demandType !== "all") {
      nextParams.demandType = formState.demandType;
    }

    if (formState.priceRange !== "all") {
      nextParams.maxPrice = Number(formState.priceRange);
    }

    if (formState.bedrooms !== "any") {
      if (formState.bedrooms === "4+") {
        nextParams.minBedrooms = 4;
      } else {
        nextParams["features.bedrooms"] = Number(formState.bedrooms);
      }
    }

    setParams(nextParams);

    const queryString = buildSearchString(nextParams, formState.query);
    router.replace(
      `${ROUTES.PROPERTY_MAP_SEARCH}${queryString ? `?${queryString}` : ""}`,
      {
        scroll: false,
      },
    );
  };

  const handlePageChange = (page: number) => {
    const nextParams = {
      ...params,
      page,
    };

    setParams(nextParams);

    const queryString = buildSearchString(nextParams, formState.query);
    router.replace(
      `${ROUTES.PROPERTY_MAP_SEARCH}${queryString ? `?${queryString}` : ""}`,
      {
        scroll: false,
      },
    );
  };

  const handleSortChange = (value: string | number) => {
    const nextParams: IParamsPagination = {
      ...params,
      page: 1,
    };

    if (value === "price_asc") {
      nextParams.sortField = "features.price";
      nextParams.sortOrder = "asc";
    } else if (value === "price_desc") {
      nextParams.sortField = "features.price";
      nextParams.sortOrder = "desc";
    } else {
      delete nextParams.sortField;
      delete nextParams.sortOrder;
    }

    setParams(nextParams);

    const queryString = buildSearchString(nextParams, formState.query);
    router.replace(
      `${ROUTES.PROPERTY_MAP_SEARCH}${queryString ? `?${queryString}` : ""}`,
      {
        scroll: false,
      },
    );
  };

  const handleLocationSelect = (location: GeocodedLocation | null) => {
    if (!location) {
      setFormState((current) => ({
        ...current,
        latitude: null,
        longitude: null,
        radiusKm: DEFAULT_RADIUS_KM,
      }));
      return;
    }

    setFormState((current) => ({
      ...current,
      query: location.displayAddress,
      latitude: location.latitude,
      longitude: location.longitude,
      radiusKm: DEFAULT_RADIUS_KM,
    }));
  };

  const handleReset = () => {
    setParams(DEFAULT_PARAMS);
    setFormState(DEFAULT_FORM_STATE);
    setActivePropertyId(null);
    router.replace(ROUTES.PROPERTY_MAP_SEARCH, {
      scroll: false,
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f4ee_0%,#ffffff_28%,#fbfaf7_100%)] pb-16">
      <main className="container mx-auto px-4 py-6 md:px-10 xl:px-16">
        <section className="relative z-30 overflow-visible rounded-[32px] border border-stone-200 bg-white p-4 shadow-[0_30px_80px_-48px_rgba(15,23,42,0.28)] md:p-6">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,2.2fr)_148px_180px_180px_180px_132px_56px]">
            <div className="relative z-40 rounded-2xl border border-stone-200 bg-stone-50/70">
              <LocationAutocomplete
                value={formState.query}
                onChange={(value) =>
                  setFormState((current) => ({
                    ...current,
                    query: value,
                    latitude: null,
                    longitude: null,
                    radiusKm: DEFAULT_RADIUS_KM,
                  }))
                }
                onSelectLocation={handleLocationSelect}
                placeholder={t("filters.searchPlaceholder")}
                className="!h-2"
              />
            </div>

            <CsSelect
              value={formState.demandType}
              onChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  demandType: String(value),
                }))
              }
              options={demandTypeOptions}
              triggerClassName="rounded-2xl border-stone-200 bg-stone-50/70 px-4"
            />

            <CsSelect
              value={formState.propertyType}
              onChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  propertyType: String(value),
                }))
              }
              options={propertyTypeOptions}
              triggerClassName=" rounded-2xl border-stone-200 bg-stone-50/70 px-4"
            />

            <CsSelect
              value={formState.priceRange}
              onChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  priceRange: String(value),
                }))
              }
              options={priceRangeOptions}
              triggerClassName="h-14 rounded-2xl border-stone-200 bg-stone-50/70 px-4"
            />

            <CsSelect
              value={formState.bedrooms}
              onChange={(value) =>
                setFormState((current) => ({
                  ...current,
                  bedrooms: String(value),
                }))
              }
              options={bedroomOptions}
              triggerClassName="!h-10.5 rounded-2xl border-stone-200 bg-stone-50/70 px-4"
            />

            <CsButton
              type="button"
              onClick={handleSearch}
              className="!h-10.5 rounded-2xl bg-stone-900 px-6 text-white hover:bg-stone-800"
              icon={<Search className="mr-2 h-4 w-4" />}
            >
              {t("filters.search")}
            </CsButton>

            <CsButton
              onClick={handleReset}
              icon={<RefreshCwIcon />}
              className="max-w-10"
            ></CsButton>
          </div>
        </section>

        <section className="relative z-10 mt-6 grid gap-6 xl:grid-cols-2 xl:items-start">
          <div className="rounded-[32px] border border-stone-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-5 flex flex-col gap-3 border-b border-stone-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-stone-900">
                  <Grid3X3 className="h-4 w-4 text-red-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                    {t("list.eyebrow")}
                  </p>
                </div>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
                  {t("list.title")}
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {t("list.results", {
                    count: results.length,
                    total: data?.data?.totalResults || 0,
                  })}
                </p>
              </div>

              {isFetching && !isLoading ? (
                <span className="text-sm font-medium text-stone-500">
                  {t("list.updating")}
                </span>
              ) : (
                <div className="w-full sm:w-56">
                  <CsSelect
                    value={getSortValue(params)}
                    onChange={handleSortChange}
                    options={sortOptions}
                    className="h-10 border-stone-200 bg-white"
                  />
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <PropertyCardSkeleton
                    key={`advanced-search-card-skeleton-${index + 1}`}
                  />
                ))}
              </div>
            ) : isError ? (
              <StateSurface
                tone="danger"
                eyebrow={t("list.eyebrow")}
                icon={<AlertCircle className="h-5 w-5" />}
                title={t("list.errorTitle")}
                description={t("list.errorDescription")}
                primaryAction={{
                  label: t("list.retry"),
                  onClick: () => {
                    void refetch();
                  },
                }}
              />
            ) : results.length === 0 ? (
              <StateSurface
                tone="brand"
                eyebrow={t("list.eyebrow")}
                icon={<House className="h-5 w-5" />}
                title={t("list.emptyTitle")}
                description={t("list.emptyDescription")}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                  {results.map((property) => (
                    <div
                      key={property._id}
                      onMouseEnter={() => setActivePropertyId(property._id)}
                    >
                      <PropertyCard
                        id={property._id}
                        image={property.media?.thumbnail}
                        title={property.title}
                        badges={{
                          aiRecommended: false,
                          tour3D: property.media?.virtualTourUrls?.length > 0,
                        }}
                        address={`${property.location?.address}, ${findOptionLabel(property.location?.ward, LIST_WARD)}, ${findOptionLabel(property.location?.province, LIST_PROVINCE)}`}
                        price={String(property.features?.price || 0)}
                        currency={property.features?.currency}
                        unit={property.features?.priceUnit}
                        specs={{
                          beds: property.features?.bedrooms || 0,
                          baths: property.features?.bathrooms || 0,
                          area: property.features?.area || 0,
                        }}
                        agent={{
                          name: property.userId?.fullName,
                          avatar: property.userId?.avatarUrl,
                        }}
                        postedAt={formatPropertyPostedDate(
                          property.createdAt,
                          locale,
                        )}
                        type={
                          property.demandType?.toLowerCase() === "sale"
                            ? "sale"
                            : "rent"
                        }
                        isFavorite={property.isFavorite}
                        compareItem={mapPropertyToCompareItem(property)}
                        className={
                          activePropertyId === property._id
                            ? "ring-2 ring-stone-900 ring-offset-2 ring-offset-white"
                            : ""
                        }
                      />
                    </div>
                  ))}
                </div>

                {(data?.data?.totalResults || 0) > 0 ? (
                  <div className="mt-6 flex justify-center border-t border-stone-100 pt-5">
                    <CsPagination
                      total={data?.data?.totalResults || 0}
                      current={data?.data?.page || 1}
                      pageSize={data?.data?.limit || DEFAULT_PARAMS.limit}
                      onChange={handlePageChange}
                      disabled={isFetching}
                    />
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="self-start rounded-[32px] border border-stone-200 bg-white p-4 shadow-sm md:p-5 xl:sticky xl:top-24">
            <div className="mb-5 border-b border-stone-100 pb-4">
              <div className="flex items-center gap-2 text-stone-900">
                <MapPinned className="h-4 w-4 text-red-500" />
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">
                  {t("map.eyebrow")}
                </p>
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900">
                {t("map.title")}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {t("map.description")}
              </p>
            </div>

            <PropertyResultsMap
              items={mapItems}
              activeId={activePropertyId}
              onSelect={setActivePropertyId}
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdvancedPropertySearch;
