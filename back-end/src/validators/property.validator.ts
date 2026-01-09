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
      location: z.object({
        province: z.string().min(1, t.required("Tỉnh/Thành phố")),
        district: z.string().min(1, t.required("Quận/Huyện")),
        ward: z.string().min(1, t.required("Phường/Xã")),
        address: z.string().min(1, t.required("Địa chỉ cụ thể")),
        hideAddress: z.boolean().optional(),
        coordinates: z
          .object({
            lat: z.number(),
            long: z.number(),
          })
          .optional(),
      }),
      features: z.object({
        area: z.number().positive("Diện tích phải lớn hơn 0"),
        price: z.number().positive("Mức giá phải lớn hơn 0"),
        priceUnit: z.nativeEnum(PriceUnitEnum),
        bedrooms: z.number().optional(),
        bathrooms: z.number().optional(),
        floors: z.number().optional(),
        direction: z.nativeEnum(PropertyDirectionEnum).optional(),
        frontage: z.number().optional(),
        entranceWidth: z.number().optional(),
        furniture: z.nativeEnum(PropertyFurnitureEnum).optional(),
        legalStatus: z.nativeEnum(PropertyLegalStatusEnum).optional(),
      }),
      amenities: z.array(z.string()).optional(),
      media: z
        .object({
          images: z.array(z.string()).optional(),
          thumbnail: z.string().optional(),
          videoLink: z.string().optional(),
        })
        .optional(),
      description: z.string().min(1, t.required("Mô tả")),
    }),
  });
};
