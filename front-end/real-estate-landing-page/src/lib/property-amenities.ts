export interface PropertyAmenityOption {
  value: string;
  label: string;
  translationKey: string;
  icon: string;
}

const CUSTOM_AMENITY_ICON = "+";

export const PROPERTY_AMENITIES: PropertyAmenityOption[] = [
  {
    value: "pool",
    label: "Swimming Pool",
    translationKey: "detail.swimmingPool",
    icon: "🏊",
  },
  {
    value: "gym",
    label: "Gym & Fitness",
    translationKey: "detail.gymFitness",
    icon: "💪",
  },
  {
    value: "parking",
    label: "Parking",
    translationKey: "detail.parking",
    icon: "🚗",
  },
  {
    value: "elevator",
    label: "Elevator",
    translationKey: "detail.elevator",
    icon: "🛗",
  },
  {
    value: "security",
    label: "24/7 Security",
    translationKey: "detail.security",
    icon: "🛡️",
  },
  {
    value: "wifi",
    label: "Wifi & Internet",
    translationKey: "detail.wifi",
    icon: "📶",
  },
];

const normalizeAmenityLookup = (amenity: string) =>
  normalizePropertyAmenity(amenity).toLocaleLowerCase();

export const PROPERTY_AMENITY_MAP = PROPERTY_AMENITIES.reduce<
  Record<string, PropertyAmenityOption>
>((accumulator, option) => {
  accumulator[option.value] = option;
  return accumulator;
}, {});

export const normalizePropertyAmenity = (amenity: string) => {
  const normalized = amenity.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "";
  }

  return `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
};

export const findPropertyAmenityOption = (amenity: string) => {
  const rawAmenity = amenity.trim().toLocaleLowerCase();
  const normalizedAmenity = normalizeAmenityLookup(amenity);

  return PROPERTY_AMENITIES.find((option) => {
    return (
      option.value.toLocaleLowerCase() === rawAmenity ||
      normalizeAmenityLookup(option.label) === normalizedAmenity
    );
  });
};

export const isSamePropertyAmenity = (left: string, right: string) => {
  return (
    normalizeAmenityLookup(getPropertyAmenityLabel(left)) ===
    normalizeAmenityLookup(getPropertyAmenityLabel(right))
  );
};

export const getPropertyAmenityLabel = (amenity: string) => {
  return (
    findPropertyAmenityOption(amenity)?.label ||
    normalizePropertyAmenity(amenity)
  );
};

export const getPropertyAmenityDisplay = (amenity: string) => {
  const option = findPropertyAmenityOption(amenity);

  return {
    value: option?.value || amenity,
    label: option?.label || normalizePropertyAmenity(amenity),
    icon: option?.icon || CUSTOM_AMENITY_ICON,
    translationKey: option?.translationKey,
  };
};
