import {
  AdminUnitService,
  type AdministrativeUnitOption,
} from "@/services/admin-unit.service";
import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import { redis } from "@/config/redis";
import { singleton } from "@/decorators/singleton";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import {
  buildPhotonAddressLine,
  formatPhotonAddress,
  isVietnamCountry,
  type PhotonFeature,
  type PhotonLocationProperties,
} from "@/utils/location";

const DEFAULT_CENTER = {
  latitude: 10.762622,
  longitude: 106.660172,
};

interface PhotonResponse {
  features?: PhotonFeature[];
}

interface SearchLocationsOptions {
  limit?: number;
  lat?: number;
  lng?: number;
  lang?: string;
}

interface ReverseGeocodeOptions {
  lat: number;
  lng: number;
  lang?: string;
}

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

interface SearchLocationsResponse {
  provider: "photon";
  results: GeocodedLocation[];
}

interface ReverseGeocodeResponse {
  provider: "photon";
  result: GeocodedLocation | null;
}

@singleton
export class LocationService {
  private readonly provider = "photon" as const;
  private readonly baseUrl = ENV.GEOCODING_BASE_URL;
  private readonly adminUnitService = new AdminUnitService();
  private readonly supportedPhotonLanguages = new Set([
    "default",
    "en",
    "de",
    "fr",
  ]);
  private readonly adminLookupTimeoutMs = Math.min(
    ENV.ADMIN_UNITS_TIMEOUT_MS,
    1500,
  );

  async searchLocations(
    query: string,
    options: SearchLocationsOptions = {},
  ): Promise<SearchLocationsResponse> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) {
      return {
        provider: this.provider,
        results: [],
      };
    }

    const limit = this.clampLimit(options.limit);
    const requestedLang = options.lang || ENV.GEOCODING_DEFAULT_LANGUAGE;
    const lang = this.normalizePhotonLanguage(requestedLang);
    const lat = options.lat ?? DEFAULT_CENTER.latitude;
    const lng = options.lng ?? DEFAULT_CENTER.longitude;
    const cacheKey = `location:search:${lang || "local"}:${limit}:${lat}:${lng}:${normalizedQuery.toLowerCase()}`;
    const cached = await this.getCached<SearchLocationsResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      q: normalizedQuery,
      limit: String(limit),
      lat: String(lat),
      lon: String(lng),
    });

    if (lang) {
      params.set("lang", lang);
    }

    const data = await this.request<PhotonResponse>(
      `/api?${params.toString()}`,
    );
    const features = data.features || [];
    const prioritizedFeatures = this.prioritizeVietnamResults(features, limit);
    const payload: SearchLocationsResponse = {
      provider: this.provider,
      results: (
        await Promise.all(
          prioritizedFeatures.map((feature) =>
            this.toGeocodedLocation(feature),
          ),
        )
      ).filter((item): item is GeocodedLocation => Boolean(item)),
    };

    await this.setCached(cacheKey, payload);

    return payload;
  }

  async reverseGeocode(
    options: ReverseGeocodeOptions,
  ): Promise<ReverseGeocodeResponse> {
    const requestedLang = options.lang || ENV.GEOCODING_DEFAULT_LANGUAGE;
    const lang = this.normalizePhotonLanguage(requestedLang);
    const cacheKey = `location:reverse:${lang || "local"}:${options.lat}:${options.lng}`;
    const cached = await this.getCached<ReverseGeocodeResponse>(cacheKey);

    if (cached) {
      return cached;
    }

    const params = new URLSearchParams({
      lat: String(options.lat),
      lon: String(options.lng),
    });

    if (lang) {
      params.set("lang", lang);
    }

    const data = await this.request<PhotonResponse>(
      `/reverse?${params.toString()}`,
    );
    const prioritizedFeatures = this.prioritizeVietnamResults(
      data.features || [],
      1,
    );

    let result: GeocodedLocation | null = null;
    for (const feature of prioritizedFeatures) {
      const candidate = await this.toGeocodedLocation(feature);
      if (candidate) {
        result = candidate;
        break;
      }
    }

    const payload: ReverseGeocodeResponse = {
      provider: this.provider,
      result,
    };

    await this.setCached(cacheKey, payload);

    return payload;
  }

  async getProvinceOptions() {
    return this.adminUnitService.getProvinceOptions();
  }

  async getLocalUnitOptions(provinceCode: number) {
    return this.adminUnitService.getLocalUnitOptions(provinceCode);
  }

  private clampLimit(limit?: number) {
    if (!limit || Number.isNaN(limit)) {
      return 5;
    }

    return Math.min(Math.max(Math.floor(limit), 1), 10);
  }

  private normalizePhotonLanguage(lang?: string) {
    const normalized = lang?.trim().toLowerCase();

    if (!normalized || normalized === "vi" || normalized === "default") {
      return "default";
    }

    return this.supportedPhotonLanguages.has(normalized)
      ? normalized
      : "default";
  }

  private prioritizeVietnamResults(features: PhotonFeature[], limit: number) {
    const vietnamFeatures = features.filter((feature) =>
      isVietnamCountry(feature.properties.country),
    );

    return (vietnamFeatures.length > 0 ? vietnamFeatures : features).slice(
      0,
      limit,
    );
  }

  private async toGeocodedLocation(
    feature: PhotonFeature,
  ): Promise<GeocodedLocation | null> {
    const [longitude, latitude] = feature.geometry.coordinates;
    if (
      typeof latitude !== "number" ||
      Number.isNaN(latitude) ||
      typeof longitude !== "number" ||
      Number.isNaN(longitude)
    ) {
      return null;
    }

    const properties = feature.properties || ({} as PhotonLocationProperties);
    const fallbackProvinceValue =
      properties.city || properties.state || properties.county || "";
    const fallbackLocalUnitValue =
      properties.suburb ||
      properties.quarter ||
      properties.locality ||
      properties.district ||
      properties.name ||
      "";

    let province: AdministrativeUnitOption | null = null;
    let localUnit: AdministrativeUnitOption | null = null;

    try {
      ({ province, localUnit } = await this.withTimeout(
        this.resolveAdministrativeUnits(properties),
        this.adminLookupTimeoutMs,
        "Administrative unit lookup timed out",
      ));
    } catch (error) {
      logger.warn("Failed to enrich geocoded location with admin units", {
        error,
        provinceHint: fallbackProvinceValue,
        localUnitHint: fallbackLocalUnitValue,
      });
    }

    return {
      name: properties.name || properties.street || "Unknown",
      addressLine: buildPhotonAddressLine(properties),
      displayAddress: formatPhotonAddress(properties),
      latitude,
      longitude,
      provinceValue: province?.value || fallbackProvinceValue,
      provinceCode: province?.code || null,
      wardValue: localUnit?.value || fallbackLocalUnitValue,
      wardCode: localUnit?.code || null,
      wardDivisionType: localUnit?.divisionType || "",
      country: properties.country || "",
      source: this.provider,
    };
  }

  private async resolveAdministrativeUnits(
    properties: PhotonLocationProperties,
  ): Promise<{
    province: AdministrativeUnitOption | null;
    localUnit: AdministrativeUnitOption | null;
  }> {
    const province = await this.adminUnitService.findProvinceByName(
      properties.city || properties.state || properties.county,
    );
    const localUnit = province
      ? await this.resolveLocalUnit(properties, province)
      : null;

    return {
      province,
      localUnit,
    };
  }

  private async resolveLocalUnit(
    properties: PhotonLocationProperties,
    province: AdministrativeUnitOption,
  ): Promise<AdministrativeUnitOption | null> {
    const wardCandidates = Array.from(
      new Set(
        [
          properties.suburb,
          properties.quarter,
          properties.locality,
          properties.district,
          properties.name,
        ]
          .map((candidate) => candidate?.trim())
          .filter((candidate): candidate is string => Boolean(candidate)),
      ),
    ).slice(0, 3);

    for (const candidate of wardCandidates) {
      const directMatch = await this.adminUnitService.findLocalUnitByName(
        candidate,
        province.code,
      );

      if (directMatch) {
        return directMatch;
      }
    }

    for (const candidate of wardCandidates.slice(0, 2)) {
      const legacyMatch = await this.adminUnitService.findLocalUnitByLegacyName(
        candidate,
        province.code,
      );

      if (legacyMatch) {
        return legacyMatch;
      }
    }

    return null;
  }

  private async request<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "graduation-real-estate-platform/1.0",
        },
        signal: AbortSignal.timeout(ENV.GEOCODING_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new AppError(
          `Geocoding provider responded with status ${response.status}`,
          503,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }
      const resp = await response.json();
      return resp as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Location provider request failed", error);
      throw new AppError(
        "Unable to resolve location at the moment",
        503,
        ErrorCode.EXTERNAL_SERVICE_ERROR,
      );
    }
  }

  private async getCached<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      return cached ? (JSON.parse(cached) as T) : null;
    } catch (error) {
      logger.warn(`Failed to read location cache for key ${key}`, error);
      return null;
    }
  }

  private async setCached(key: string, value: unknown) {
    try {
      await redis.set(
        key,
        JSON.stringify(value),
        ENV.GEOCODING_CACHE_TTL_SECONDS,
      );
    } catch (error) {
      logger.warn(`Failed to write location cache for key ${key}`, error);
    }
  }

  private async withTimeout<T>(
    promise: Promise<T>,
    timeoutMs: number,
    errorMessage: string,
  ): Promise<T> {
    let timeoutId: NodeJS.Timeout | null = null;

    try {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(errorMessage));
          }, timeoutMs);
        }),
      ]);
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  }
}
