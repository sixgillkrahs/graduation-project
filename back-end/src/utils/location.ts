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

const ADMIN_WORD_PATTERN =
  /\b(tp|tp\.|thanh pho|tinh|province|city|state|phuong|xa|ward|commune|thi tran|township|town|suburb|quarter|locality)\b/gu;

export const normalizeLocationText = (value?: string) => {
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
  return normalizedCountry === "vietnam" || normalizedCountry === "viet nam";
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
