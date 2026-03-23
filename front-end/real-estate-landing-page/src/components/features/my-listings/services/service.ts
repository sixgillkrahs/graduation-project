import type {
  IPaginationResp,
  IParamsPagination,
  IResp,
} from "@/@types/service";
import { AxiosMethod } from "@/lib/axios/method";
import request from "@/lib/axios/request";
import type { ListingFormData } from "../dto/listingformdata.dto";
import type { IPropertyDto } from "../dto/property.dto";
import { PropertyEndpoint } from "./config";

const PropertyService = {
  defaultFormValues: {
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
  } satisfies ListingFormData,

  stepFields: {
    step1: [
      "demandType",
      "propertyType",
      "projectName",
      "description",
      "title",
    ] as const,
    step2: ["province", "ward", "address", "latitude", "longitude"] as const,
    step3: [
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
    ] as const,
    step4: ["images", "thumbnail", "videoLink", "virtualTourUrls"] as const,
  },

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
      data: body,
    });
  },

  updateProperty: (
    id: string,
    body: ListingFormData,
  ): Promise<IResp<IPropertyDto>> => {
    return request({
      url: PropertyEndpoint.updateProperty(id),
      method: AxiosMethod.PUT,
      data: body,
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
