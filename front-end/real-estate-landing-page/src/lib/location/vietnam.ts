import { LIST_PROVINCE, LIST_WARD } from "gra-helper";

export type LocationOption = {
  label: string;
  value: string;
};

export interface PhotonLocationProperties {
  name?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  suburb?: string;
  quarter?: string;
  postcode?: string;
  locality?: string;
  county?: string;
}

export interface PhotonFeature {
  geometry: {
    coordinates: [number, number];
  };
  properties: PhotonLocationProperties;
}

export interface NormalizedVietnamLocation {
  addressLine: string;
  provinceValue: string;
  wardValue: string;
}

export const VIETNAM_PROVINCES: LocationOption[] = LIST_PROVINCE;
export const VIETNAM_WARDS: LocationOption[] = LIST_WARD;

const ADMIN_WORD_PATTERN =
  /\b(tp|tp\.|thanh pho|tinh|province|city|state|phuong|xa|ward|commune|thi tran|township|town|suburb|quarter|locality)\b/gu;

const normalizeLocationText = (value?: string) => {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/đ/gu, "d")
    .replace(/[^\p{L}\p{N}\s/-]/gu, " ")
    .replace(ADMIN_WORD_PATTERN, " ")
    .replace(/\s+/gu, " ")
    .trim();
};

const findCanonicalOptionValue = (
  source: string | undefined,
  options: LocationOption[],
) => {
  const normalizedSource = normalizeLocationText(source);

  if (!normalizedSource) {
    return "";
  }

  const exactMatch = options.find((option) => {
    const normalizedLabel = normalizeLocationText(option.label);
    const normalizedValue = normalizeLocationText(option.value);

    return (
      normalizedLabel === normalizedSource || normalizedValue === normalizedSource
    );
  });

  if (exactMatch) {
    return exactMatch.value;
  }

  const partialMatch = options.find((option) => {
    const normalizedLabel = normalizeLocationText(option.label);
    const normalizedValue = normalizeLocationText(option.value);

    return (
      normalizedLabel.includes(normalizedSource) ||
      normalizedSource.includes(normalizedLabel) ||
      normalizedValue.includes(normalizedSource) ||
      normalizedSource.includes(normalizedValue)
    );
  });

  return partialMatch?.value || "";
};

const joinAddressParts = (parts: Array<string | undefined | null>) => {
  return parts
    .filter((part): part is string => Boolean(part?.trim()))
    .reduce<string[]>((result, part) => {
      if (!result.includes(part)) {
        result.push(part);
      }

      return result;
    }, [])
    .join(", ");
};

export const isVietnamCountry = (country?: string) => {
  const normalizedCountry = normalizeLocationText(country);
  return (
    normalizedCountry === "vietnam" || normalizedCountry === "viet nam"
  );
};

export const formatPhotonAddress = (props: PhotonLocationProperties) => {
  return joinAddressParts([
    props.name,
    props.street && props.housenumber
      ? `${props.housenumber} ${props.street}`
      : props.street,
    props.suburb || props.quarter || props.locality,
    props.city || props.state || props.county,
  ]);
};

export const buildPhotonAddressLine = (props: PhotonLocationProperties) => {
  const primaryAddress = [
    props.housenumber,
    props.street,
    props.name && props.name !== props.street ? props.name : null,
  ].filter(Boolean);

  return primaryAddress.join(" ") || formatPhotonAddress(props);
};

export const normalizeVietnamLocation = (
  props: PhotonLocationProperties,
): NormalizedVietnamLocation => {
  const provinceValue = findCanonicalOptionValue(
    props.city || props.state || props.county,
    VIETNAM_PROVINCES,
  );

  // Do not use the legacy district field as the primary ward source.
  const wardCandidates = [props.suburb, props.quarter, props.locality];
  const wardValue =
    wardCandidates
      .map((candidate) => findCanonicalOptionValue(candidate, VIETNAM_WARDS))
      .find(Boolean) || "";

  return {
    addressLine: buildPhotonAddressLine(props),
    provinceValue,
    wardValue,
  };
};
