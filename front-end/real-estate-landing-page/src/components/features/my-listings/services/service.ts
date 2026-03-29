import type {
  IPaginationResp,
  IParamsPagination,
  IResp,
} from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import type { ListingState } from "@/models/listing.model";
import type { ListingFormData } from "../dto/listingformdata.dto";
import type { IPropertyDto } from "../dto/property.dto";
import { PropertyEndpoint } from "./config";

const DEFAULT_FORM_VALUES = {
  demandType: "SALE",
  propertyType: "APARTMENT",
  projectName: "",
  description: "",
  title: "",
  province: "",
  ward: "",
  address: "",
  latitude: null,
  longitude: null,
  area: "",
  price: "",
  currency: "VND",
  priceUnit: "MILLION",
  bedrooms: 1,
  bathrooms: 1,
  direction: "",
  legalStatus: "",
  furniture: "",
  amenities: [],
  images: [],
  thumbnail: "",
  videoLink: "",
  virtualTourUrls: [],
} satisfies ListingFormData;

const isLandProperty = (propertyType: ListingFormData["propertyType"]) =>
  propertyType === "LAND";

const canShowLegalStatus = (demandType: ListingFormData["demandType"]) =>
  demandType === "SALE";

const canShowRoomFields = (propertyType: ListingFormData["propertyType"]) =>
  !isLandProperty(propertyType);

const canShowFurniture = (propertyType: ListingFormData["propertyType"]) =>
  !isLandProperty(propertyType);

const VALID_PROPERTY_TYPES = [
  "APARTMENT",
  "HOUSE",
  "VILLA",
  "LAND",
  "STREET_HOUSE",
] as const;

const normalizePropertyType = (
  propertyType: IPropertyDto["propertyType"],
): ListingFormData["propertyType"] =>
  (VALID_PROPERTY_TYPES as readonly string[]).includes(propertyType)
    ? (propertyType as ListingFormData["propertyType"])
    : DEFAULT_FORM_VALUES.propertyType;

const getPriceUnitOptions = (
  demandType: ListingFormData["demandType"],
  labels?: {
    vnd: string;
    million: string;
    billion: string;
    millionPerSquareMeter: string;
    vndPerMonth: string;
    millionPerMonth: string;
  },
) => {
  const fallbackLabels = {
    vnd: "VND",
    million: "Million VND",
    billion: "Billion VND",
    millionPerSquareMeter: "Million VND per m²",
    vndPerMonth: "VND per month",
    millionPerMonth: "Million VND per month",
  };
  const optionLabels = labels || fallbackLabels;

  return demandType === "RENT"
    ? [
        { label: optionLabels.vndPerMonth, value: "VND" },
        { label: optionLabels.millionPerMonth, value: "MILLION" },
      ]
    : [
        { label: optionLabels.vnd, value: "VND" },
        { label: optionLabels.million, value: "MILLION" },
        { label: optionLabels.billion, value: "BILLION" },
        {
          label: optionLabels.millionPerSquareMeter,
          value: "MILLION_PER_M2",
        },
      ];
};

const STEP3_FIELDS = [
  "area",
  "price",
  "currency",
  "priceUnit",
  "bedrooms",
  "bathrooms",
  "direction",
  "legalStatus",
  "furniture",
  "amenities",
] as const;

type Step3Field = (typeof STEP3_FIELDS)[number];

const baseStep3Fields = [
  "area",
  "price",
  "currency",
  "priceUnit",
  "direction",
  "amenities",
] as const;

const getStep3Fields = ({
  demandType,
  propertyType,
}: Pick<ListingFormData, "demandType" | "propertyType">) => {
  const fields: Step3Field[] = [...baseStep3Fields];

  if (canShowRoomFields(propertyType)) {
    fields.push("bedrooms", "bathrooms");
  }

  if (canShowLegalStatus(demandType)) {
    fields.push("legalStatus");
  }

  if (canShowFurniture(propertyType)) {
    fields.push("furniture");
  }

  return fields;
};

const sanitizeFormData = (data: ListingFormData): ListingFormData => {
  const normalizedData: ListingFormData = {
    ...data,
    legalStatus: canShowLegalStatus(data.demandType) ? data.legalStatus : "",
    furniture: canShowFurniture(data.propertyType) ? data.furniture : "",
    bedrooms: canShowRoomFields(data.propertyType) ? data.bedrooms : 0,
    bathrooms: canShowRoomFields(data.propertyType) ? data.bathrooms : 0,
  };

  const validPriceUnits = getPriceUnitOptions(normalizedData.demandType).map(
    (option) => option.value,
  );

  if (!validPriceUnits.includes(normalizedData.priceUnit)) {
    normalizedData.priceUnit = DEFAULT_FORM_VALUES.priceUnit;
  }

  return normalizedData;
};

const getFormValuesFromListingState = (
  listingData?: Partial<ListingState["data"]>,
): ListingFormData => ({
  ...DEFAULT_FORM_VALUES,
  demandType: listingData?.demandType || DEFAULT_FORM_VALUES.demandType,
  propertyType: listingData?.propertyType || DEFAULT_FORM_VALUES.propertyType,
  projectName: listingData?.projectName || DEFAULT_FORM_VALUES.projectName,
  title: listingData?.title || DEFAULT_FORM_VALUES.title,
  description: listingData?.description || DEFAULT_FORM_VALUES.description,
  province: listingData?.location?.province || DEFAULT_FORM_VALUES.province,
  ward: listingData?.location?.ward || DEFAULT_FORM_VALUES.ward,
  address: listingData?.location?.address || DEFAULT_FORM_VALUES.address,
  latitude: listingData?.location?.latitude || DEFAULT_FORM_VALUES.latitude,
  longitude: listingData?.location?.longitude || DEFAULT_FORM_VALUES.longitude,
  area: String(listingData?.features?.area || DEFAULT_FORM_VALUES.area),
  price: String(listingData?.features?.price || DEFAULT_FORM_VALUES.price),
  currency: listingData?.features?.currency || DEFAULT_FORM_VALUES.currency,
  priceUnit: listingData?.features?.priceUnit || DEFAULT_FORM_VALUES.priceUnit,
  bedrooms: listingData?.features?.bedrooms || DEFAULT_FORM_VALUES.bedrooms,
  bathrooms: listingData?.features?.bathrooms || DEFAULT_FORM_VALUES.bathrooms,
  direction: listingData?.features?.direction || DEFAULT_FORM_VALUES.direction,
  legalStatus:
    listingData?.features?.legalStatus || DEFAULT_FORM_VALUES.legalStatus,
  furniture: listingData?.features?.furniture || DEFAULT_FORM_VALUES.furniture,
  amenities: listingData?.amenities || DEFAULT_FORM_VALUES.amenities,
  images: listingData?.media?.images || DEFAULT_FORM_VALUES.images,
  thumbnail: listingData?.media?.thumbnail || DEFAULT_FORM_VALUES.thumbnail,
  videoLink: listingData?.media?.videoLink || DEFAULT_FORM_VALUES.videoLink,
  virtualTourUrls:
    listingData?.media?.virtualTourUrls || DEFAULT_FORM_VALUES.virtualTourUrls,
});

const getFormValuesFromProperty = (property: IPropertyDto): ListingFormData => ({
  ...DEFAULT_FORM_VALUES,
  demandType: property.demandType,
  propertyType: normalizePropertyType(property.propertyType),
  projectName: property.projectName || DEFAULT_FORM_VALUES.projectName,
  title: property.title || DEFAULT_FORM_VALUES.title,
  description: property.description || DEFAULT_FORM_VALUES.description,
  province: property.location?.province || DEFAULT_FORM_VALUES.province,
  ward: property.location?.ward || DEFAULT_FORM_VALUES.ward,
  address: property.location?.address || DEFAULT_FORM_VALUES.address,
  latitude: property.location?.coordinates?.lat || DEFAULT_FORM_VALUES.latitude,
  longitude:
    property.location?.coordinates?.long || DEFAULT_FORM_VALUES.longitude,
  area: String(property.features?.area || DEFAULT_FORM_VALUES.area),
  price: String(property.features?.price || DEFAULT_FORM_VALUES.price),
  currency: property.features?.currency || DEFAULT_FORM_VALUES.currency,
  priceUnit: property.features?.priceUnit || DEFAULT_FORM_VALUES.priceUnit,
  bedrooms: property.features?.bedrooms || DEFAULT_FORM_VALUES.bedrooms,
  bathrooms: property.features?.bathrooms || DEFAULT_FORM_VALUES.bathrooms,
  direction: property.features?.direction || DEFAULT_FORM_VALUES.direction,
  legalStatus:
    property.features?.legalStatus || DEFAULT_FORM_VALUES.legalStatus,
  furniture: property.features?.furniture || DEFAULT_FORM_VALUES.furniture,
  amenities: property.amenities || DEFAULT_FORM_VALUES.amenities,
  images: property.media?.images || DEFAULT_FORM_VALUES.images,
  thumbnail: property.media?.thumbnail || DEFAULT_FORM_VALUES.thumbnail,
  videoLink: property.media?.videoLink || DEFAULT_FORM_VALUES.videoLink,
  virtualTourUrls:
    property.media?.virtualTourUrls || DEFAULT_FORM_VALUES.virtualTourUrls,
});

const PropertyService = {
  defaultFormValues: DEFAULT_FORM_VALUES,

  stepFields: {
    step1: [
      "demandType",
      "propertyType",
      "projectName",
      "description",
      "title",
    ] as const,
    step2: ["province", "ward", "address", "latitude", "longitude"] as const,
    step3: STEP3_FIELDS,
    step4: ["images", "thumbnail", "videoLink", "virtualTourUrls"] as const,
  },

  canShowLegalStatus,

  canShowRoomFields,

  canShowFurniture,

  getPriceUnitOptions,

  getStep3Fields,

  sanitizeFormData,

  normalizePropertyType,

  getFormValuesFromListingState,

  getFormValuesFromProperty,

  getProperties: (
    params?: IParamsPagination,
  ): Promise<IPaginationResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.getProperties(),
      method: AxiosMethod.GET,
      params,
    });
  },

  createProperty: (body: ListingFormData): Promise<IResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.createProperty(),
      method: AxiosMethod.POST,
      data: sanitizeFormData(body),
    });
  },

  updateProperty: (
    id: string,
    body: ListingFormData,
  ): Promise<IResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.updateProperty(id),
      method: AxiosMethod.PUT,
      data: sanitizeFormData(body),
    });
  },

  updatePropertyStatus: (
    id: string,
    status: string,
    soldPrice?: string,
    soldTo?: string,
    soldToEmail?: string,
    soldAt?: string,
  ): Promise<IResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.updatePropertyStatus(id),
      method: AxiosMethod.PATCH,
      data: { status, soldPrice, soldTo, soldToEmail, soldAt },
    });
  },

  getPropertyDetail: (id: string): Promise<IResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.getPropertyDetail(id),
      method: AxiosMethod.GET,
    });
  },
};

export default PropertyService;
