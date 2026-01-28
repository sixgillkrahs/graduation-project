import { validationMessages } from "@/i18n/validationMessages";
import {
  PriceUnitEnum,
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
      demandType: z.nativeEnum(PropertyDemandTypeEnum),
      propertyType: z.nativeEnum(PropertyTypeEnum),
      projectName: z.string().optional(),
      province: z.string().min(1, t.required("Tỉnh/Thành phố")),
      ward: z.string().min(1, t.required("Phường/Xã")),
      address: z.string().min(1, t.required("Địa chỉ cụ thể")),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      area: z.string().or(z.number()), // Frontend sends string "48"
      price: z.string().or(z.number()), // Frontend sends string "490"
      bedrooms: z.number().or(z.string()).optional(),
      bathrooms: z.number().or(z.string()).optional(),
      direction: z
        .nativeEnum(PropertyDirectionEnum)
        .optional()
        .or(z.literal("")),
      legalStatus: z
        .nativeEnum(PropertyLegalStatusEnum)
        .optional()
        .or(z.literal("")),
      furniture: z
        .nativeEnum(PropertyFurnitureEnum)
        .optional()
        .or(z.literal("")),
      images: z.array(z.string()).optional(),
      description: z.string().optional(), // Make optional if missing in sample
    }),
  });
};
