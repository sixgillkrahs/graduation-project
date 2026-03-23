import { client } from "@/lib/axios/axios";

export interface GeocodedLocation {
  name: string;
  addressLine: string;
  displayAddress: string;
  latitude: number;
  longitude: number;
  provinceValue: string;
  provinceCode: number | null;
  wardValue: string;
  wardCode: number | null;
  wardDivisionType: string;
  country: string;
  source: "photon";
}

export interface AdministrativeUnitOption {
  label: string;
  value: string;
  code: number;
  divisionType: string;
  codename: string;
  provinceCode?: number;
  shortCodename?: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface SearchLocationsResponse {
  provider: "photon";
  results: GeocodedLocation[];
}

interface ReverseGeocodeResponse {
  provider: "photon";
  result: GeocodedLocation | null;
}

interface AdministrativeUnitsResponse {
  results: AdministrativeUnitOption[];
}

export const searchLocations = async (query: string) => {
  const response = await client.get<ApiEnvelope<SearchLocationsResponse>>(
    "/locations/search",
    {
      params: {
        q: query,
        limit: 5,
        lat: 10.762622,
        lng: 106.660172,
      },
    },
  );

  return response.data.data.results;
};

export const reverseGeocode = async (lat: number, lng: number) => {
  const response = await client.get<ApiEnvelope<ReverseGeocodeResponse>>(
    "/locations/reverse",
    {
      params: {
        lat,
        lng,
      },
    },
  );

  return response.data.data.result;
};

export const getProvinceOptions = async () => {
  const response = await client.get<ApiEnvelope<AdministrativeUnitsResponse>>(
    "/locations/provinces",
  );

  return response.data.data.results;
};

export const getLocalUnitOptions = async (provinceCode: number) => {
  const response = await client.get<ApiEnvelope<AdministrativeUnitsResponse>>(
    "/locations/local-units",
    {
      params: {
        provinceCode,
      },
    },
  );

  return response.data.data.results;
};
