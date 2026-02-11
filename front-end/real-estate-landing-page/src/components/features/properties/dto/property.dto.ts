export interface PropertyDto {
  userId: UserId;
  demandType: string;
  propertyType: string;
  projectName: string;
  location: Location;
  features: Features;
  amenities: any[];
  media: Media;
  title: string;
  description: string;
  status: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  id: string;
}

export interface UserId {
  email: string;
  fullName: string;
  prefixPhone: string;
  phone: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string;
  id: string;
  _id?: string;
}

export interface Location {
  coordinates: Coordinates;
  province: string;
  district: string;
  ward: string;
  address: string;
  hideAddress: boolean;
}

export interface Coordinates {
  lat: number;
  long: number;
}

export interface Features {
  area: number;
  price: number;
  priceUnit: string;
  bedrooms: number;
  bathrooms: number;
  direction: string;
  furniture: string;
  legalStatus: string;
}

export interface Media {
  images: string[];
  thumbnail: string;
  virtualTourUrls: string[];
}
