import { env } from "@/config/env";
import type { PropertyDto } from "@/components/features/properties/dto/property.dto";
import type { Metadata } from "next";
import { cache } from "react";

const BRAND_NAME = "Havenly";
const DEFAULT_DESCRIPTION =
  "Discover verified property listings, connect with agents, and explore homes for sale or rent on Havenly.";

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getSiteUrl = () => {
  const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (explicitSiteUrl) {
    return trimTrailingSlash(explicitSiteUrl);
  }

  return trimTrailingSlash(env.NEXT_PUBLIC_API_BASE_URL).replace(/\/api$/, "");
};

export const getMetadataBase = () => new URL(getSiteUrl());

export const getAbsoluteUrl = (path = "/") => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
};

const stripHtml = (value?: string) =>
  (value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const truncate = (value: string, maxLength: number) => {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
};

const formatPrice = (property: PropertyDto) => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: property.features.currency || "VND",
    maximumFractionDigits: 0,
  });

  return formatter.format(property.features.price || 0);
};

const getPropertyImages = (property: PropertyDto) => {
  const images = [
    property.media.thumbnail,
    ...(property.media.images || []),
  ].filter(Boolean);

  return images.length ? images : ["/placeholder.jpg"];
};

const getSeoDescription = (property: PropertyDto) => {
  const summary = [
    property.propertyType,
    property.demandType,
    property.location?.district,
    property.location?.province,
    property.features?.bedrooms
      ? `${property.features.bedrooms} bedrooms`
      : undefined,
    property.features?.bathrooms
      ? `${property.features.bathrooms} bathrooms`
      : undefined,
    property.features?.area ? `${property.features.area} m2` : undefined,
    formatPrice(property),
  ]
    .filter(Boolean)
    .join(" | ");

  const detail = stripHtml(property.description);
  return truncate(
    detail ? `${summary}. ${detail}` : summary || DEFAULT_DESCRIPTION,
    160,
  );
};

const mapAvailability = (status?: string) => {
  if (status === "SOLD" || status === "RENTED" || status === "INACTIVE") {
    return "https://schema.org/SoldOut";
  }

  return "https://schema.org/InStock";
};

const mapAddress = (property: PropertyDto) => ({
  "@type": "PostalAddress",
  streetAddress: property.location?.address,
  addressLocality: property.location?.district,
  addressRegion: property.location?.province,
  addressCountry: "VN",
});

const mapAmenityFeatures = (amenities: string[] = []) =>
  amenities.map((amenity) => ({
    "@type": "LocationFeatureSpecification",
    name: amenity,
    value: true,
  }));

export const getPublicPropertyDetail = cache(async (id: string) => {
  try {
    const response = await fetch(
      `${trimTrailingSlash(env.NEXT_PUBLIC_API_BASE_URL)}/properties/${id}/view`,
      {
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: PropertyDto & { isFavorite: boolean };
    };

    return payload?.data || null;
  } catch (error) {
    return null;
  }
});

export const buildDefaultMetadata = (): Metadata => {
  const siteUrl = getAbsoluteUrl("/");

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: BRAND_NAME,
      template: `%s | ${BRAND_NAME}`,
    },
    description: DEFAULT_DESCRIPTION,
    alternates: {
      canonical: siteUrl,
    },
    openGraph: {
      type: "website",
      siteName: BRAND_NAME,
      title: BRAND_NAME,
      description: DEFAULT_DESCRIPTION,
      url: siteUrl,
    },
    twitter: {
      card: "summary_large_image",
      title: BRAND_NAME,
      description: DEFAULT_DESCRIPTION,
    },
  };
};

export const buildPropertyMetadata = (
  property: PropertyDto,
  propertyId: string,
): Metadata => {
  const canonicalUrl = getAbsoluteUrl(`/properties/${propertyId}`);
  const title = truncate(
    `${property.title} in ${property.location?.district || property.location?.province || "Vietnam"}`,
    60,
  );
  const description = getSeoDescription(property);
  const images = getPropertyImages(property).map((url) =>
    url.startsWith("http") ? url : getAbsoluteUrl(url),
  );

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "article",
      title,
      description,
      url: canonicalUrl,
      siteName: BRAND_NAME,
      images: images.map((url) => ({
        url,
        alt: property.title,
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
};

export const buildPropertyBreadcrumbSchema = (
  property: PropertyDto,
  propertyId: string,
) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: getAbsoluteUrl("/"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Properties",
      item: getAbsoluteUrl("/properties"),
    },
    {
      "@type": "ListItem",
      position: 3,
      name: property.title,
      item: getAbsoluteUrl(`/properties/${propertyId}`),
    },
  ],
});

export const buildPropertyListingSchema = (
  property: PropertyDto,
  propertyId: string,
) => ({
  "@context": "https://schema.org",
  "@type": "RealEstateListing",
  name: property.title,
  description: getSeoDescription(property),
  url: getAbsoluteUrl(`/properties/${propertyId}`),
  image: getPropertyImages(property).map((url) =>
    url.startsWith("http") ? url : getAbsoluteUrl(url),
  ),
  datePosted: property.createdAt,
  dateModified: property.updatedAt,
  category: property.propertyType,
  about: property.projectName || property.demandType,
  offers: {
    "@type": "Offer",
    price: property.features?.price,
    priceCurrency: property.features?.currency || "VND",
    availability: mapAvailability(property.status),
    url: getAbsoluteUrl(`/properties/${propertyId}`),
  },
  seller: {
    "@type": "RealEstateAgent",
    name: property.userId?.fullName,
    email: property.userId?.email,
    telephone: property.userId?.phone,
    url: getAbsoluteUrl(`/agents/${property.userId?._id}`),
  },
  itemOffered: {
    "@type": "Residence",
    name: property.title,
    description: stripHtml(property.description),
    numberOfRooms: property.features?.bedrooms,
    numberOfBathroomsTotal: property.features?.bathrooms,
    floorSize: property.features?.area
      ? {
          "@type": "QuantitativeValue",
          value: property.features.area,
          unitCode: "MTK",
        }
      : undefined,
    address: mapAddress(property),
    amenityFeature: mapAmenityFeatures(property.amenities),
  },
});

export const buildFaqMetadata = (
  title: string,
  description: string,
): Metadata => {
  const canonicalUrl = getAbsoluteUrl("/faq");

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl,
      siteName: BRAND_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
};

export const buildFaqBreadcrumbSchema = (faqTitle: string) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: getAbsoluteUrl("/"),
    },
    {
      "@type": "ListItem",
      position: 2,
      name: faqTitle,
      item: getAbsoluteUrl("/faq"),
    },
  ],
});

export const buildFaqSchema = (
  faqs: Array<{ question: string; answer: string }>,
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
});
