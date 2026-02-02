import { validationMessages } from "@/i18n/validationMessages";
import {
  PropertyDemandTypeEnum,
  PropertyDirectionEnum,
  PropertyFurnitureEnum,
  PropertyLegalStatusEnum,
  PropertyTypeEnum,
} from "@/models/property.model";
import { z } from "zod";

export const createPropertySchema = (lang: keyof typeof validationMessages) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      demandType: z.enum(PropertyDemandTypeEnum),
      propertyType: z.enum(PropertyTypeEnum),
      projectName: z.string().optional(),
      province: z.string().min(1, t.required("Tỉnh/Thành phố")),
      ward: z.string().min(1, t.required("Phường/Xã")),
      address: z.string().min(1, t.required("Địa chỉ cụ thể")),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      area: z.string().or(z.number()),
      price: z.string().or(z.number()),
      bedrooms: z.number().or(z.string()).optional(),
      bathrooms: z.number().or(z.string()).optional(),
      direction: z.enum(PropertyDirectionEnum).optional().or(z.literal("")),
      legalStatus: z.enum(PropertyLegalStatusEnum).optional().or(z.literal("")),
      furniture: z.enum(PropertyFurnitureEnum).optional().or(z.literal("")),
      images: z.array(z.string()).optional(),
      thumbnail: z.string().optional(),
      videoLink: z.string().optional(),
      virtualTourUrls: z.array(z.string()).optional(),
      description: z.string().optional(),
    }),
  });
};
