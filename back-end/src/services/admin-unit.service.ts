import { ENV } from "@/config/env";
import { logger } from "@/config/logger";
import { redis } from "@/config/redis";
import { singleton } from "@/decorators/singleton";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { normalizeLocationText } from "@/utils/location";

interface ProvinceApiRecord {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code?: number;
  wards?: LocalUnitApiRecord[];
}

interface LocalUnitApiRecord {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  short_codename?: string;
}

interface LegacyWardMappingRecord {
  source_code: number;
  ward: LocalUnitApiRecord;
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

@singleton
export class AdminUnitService {
  private readonly baseUrl = ENV.ADMIN_UNITS_BASE_URL;

  async getProvinceOptions(): Promise<AdministrativeUnitOption[]> {
    const cacheKey = "admin-units:provinces";
    const cached = await this.getCached<AdministrativeUnitOption[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const provinces = await this.request<ProvinceApiRecord[]>("/");
    const options = provinces
      .map((province) => this.toProvinceOption(province))
      .sort((left, right) => left.label.localeCompare(right.label, "vi"));

    await this.setCached(cacheKey, options, ENV.ADMIN_UNITS_CACHE_TTL_SECONDS);

    return options;
  }

  async getLocalUnitOptions(
    provinceCode: number,
  ): Promise<AdministrativeUnitOption[]> {
    const cacheKey = `admin-units:province:${provinceCode}:local-units`;
    const cached = await this.getCached<AdministrativeUnitOption[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const province = await this.request<ProvinceApiRecord>(
      `/p/${provinceCode}?depth=2`,
    );
    const options = (province.wards || [])
      .map((localUnit) => this.toLocalUnitOption(localUnit))
      .sort((left, right) => left.label.localeCompare(right.label, "vi"));

    await this.setCached(cacheKey, options, ENV.ADMIN_UNITS_CACHE_TTL_SECONDS);

    return options;
  }

  async findProvinceByName(
    provinceName?: string,
  ): Promise<AdministrativeUnitOption | null> {
    if (!provinceName) {
      return null;
    }

    const provinces = await this.getProvinceOptions();
    return this.findBestMatch(provinceName, provinces);
  }

  async findLocalUnitByName(
    localUnitName: string | undefined,
    provinceCode: number,
  ): Promise<AdministrativeUnitOption | null> {
    if (!localUnitName) {
      return null;
    }

    const localUnits = await this.getLocalUnitOptions(provinceCode);
    return this.findBestMatch(localUnitName, localUnits);
  }

  async findLocalUnitByLegacyName(
    legacyName: string | undefined,
    provinceCode?: number,
  ): Promise<AdministrativeUnitOption | null> {
    if (!legacyName) {
      return null;
    }

    const cacheKey = `admin-units:legacy:${normalizeLocationText(
      legacyName,
    )}:${provinceCode || "all"}`;
    const cached =
      await this.getCached<AdministrativeUnitOption | null>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    const params = new URLSearchParams({
      legacy_name: legacyName,
    });
    const results = await this.request<LegacyWardMappingRecord[]>(
      `/w/from-legacy/?${params.toString()}`,
    );
    const match = results
      .map((item) => this.toLocalUnitOption(item.ward))
      .find((item) =>
        provinceCode ? item.provinceCode === provinceCode : true,
      ) || null;

    await this.setCached(
      cacheKey,
      match,
      ENV.ADMIN_UNITS_CACHE_TTL_SECONDS,
    );

    return match;
  }

  private toProvinceOption(
    province: ProvinceApiRecord,
  ): AdministrativeUnitOption {
    return {
      label: province.name,
      value: province.name,
      code: province.code,
      divisionType: province.division_type,
      codename: province.codename,
    };
  }

  private toLocalUnitOption(
    localUnit: LocalUnitApiRecord,
  ): AdministrativeUnitOption {
    return {
      label: localUnit.name,
      value: localUnit.name,
      code: localUnit.code,
      divisionType: localUnit.division_type,
      codename: localUnit.codename,
      provinceCode: localUnit.province_code,
      shortCodename: localUnit.short_codename,
    };
  }

  private findBestMatch(
    source: string,
    options: AdministrativeUnitOption[],
  ): AdministrativeUnitOption | null {
    const normalizedSource = normalizeLocationText(source);

    if (!normalizedSource) {
      return null;
    }

    const exactMatch =
      options.find((option) =>
        [option.label, option.value, option.codename, option.shortCodename]
          .filter(Boolean)
          .map((value) => normalizeLocationText(value))
          .some((value) => value === normalizedSource),
      ) || null;

    if (exactMatch) {
      return exactMatch;
    }

    return (
      options.find((option) =>
        [option.label, option.value, option.codename, option.shortCodename]
          .filter(Boolean)
          .map((value) => normalizeLocationText(value))
          .some(
            (value) =>
              value.includes(normalizedSource) ||
              normalizedSource.includes(value),
          ),
      ) || null
    );
  }

  private async request<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        headers: {
          Accept: "application/json",
          "User-Agent": "graduation-real-estate-platform/1.0",
        },
        signal: AbortSignal.timeout(ENV.ADMIN_UNITS_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new AppError(
          `Administrative units provider responded with status ${response.status}`,
          503,
          ErrorCode.EXTERNAL_SERVICE_ERROR,
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error("Administrative units provider request failed", error);
      throw new AppError(
        "Unable to load administrative units at the moment",
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
      logger.warn(`Failed to read admin-units cache for key ${key}`, error);
      return null;
    }
  }

  private async setCached(key: string, value: unknown, ttl: number) {
    try {
      await redis.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      logger.warn(`Failed to write admin-units cache for key ${key}`, error);
    }
  }
}
