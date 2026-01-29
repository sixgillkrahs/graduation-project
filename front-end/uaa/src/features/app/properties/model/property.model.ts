export interface IProperty {
  id: string;
  userId: {
    fullName: string;
    phone: string;
    email: string;
  };
  demandType: "SALE" | "RENT";
  propertyType: "APARTMENT" | "HOUSE" | "STREET_HOUSE" | "VILLA" | "LAND" | "OTHER";
  projectName?: string;
  location: {
    province: string;
    district: string;
    ward: string;
    address: string;
    hideAddress: boolean;
    coordinates?: {
      lat: number;
      long: number;
    };
  };
  features: {
    area: number;
    price: number;
    priceUnit: "VND" | "MILLION" | "BILLION" | "MILLION_PER_M2";
    totalPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    floors?: number;
    direction?: string;
    frontage?: number;
    entranceWidth?: number;
    furniture?: string;
    legalStatus?: string;
  };
  amenities: string[];
  media: {
    images: string[];
    thumbnail?: string;
    videoLink?: string;
  };
  description: string;
  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED" | "EXPIRED" | "SOLD";
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}
