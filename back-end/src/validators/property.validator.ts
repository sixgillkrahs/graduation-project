import { validationMessages } from "@/i18n/validationMessages";
import {
  CurrencyEnum,
  PropertyDemandTypeEnum,
  PropertyDirectionEnum,
  PropertyFurnitureEnum,
  PropertyLegalStatusEnum,
  PropertyStatusEnum,
  PropertyTypeEnum,
  PriceUnitEnum,
} from "@/models/property.model";
import { z } from "zod";

export const createPropertySchema = (lang: keyof typeof validationMessages) => {
  const t = validationMessages[lang] || validationMessages.vi;
  const requiredMessage = (field: string) => t.required(field);

  const bodySchema = z
    .object({
      demandType: z.enum(PropertyDemandTypeEnum).optional(),
      propertyType: z.enum(PropertyTypeEnum).optional(),
      projectName: z.string().optional(),
      title: z.string().optional(),
      province: z.string().optional(),
      ward: z.string().optional(),
      address: z.string().optional(),
      latitude: z.number().nullable().optional(),
      longitude: z.number().nullable().optional(),
      area: z.string().or(z.number()).optional(),
      price: z.string().or(z.number()).optional(),
      currency: z.enum(CurrencyEnum).optional(),
      priceUnit: z.enum(PriceUnitEnum).optional(),
      bedrooms: z.number().or(z.string()).optional(),
      bathrooms: z.number().or(z.string()).optional(),
      direction: z.enum(PropertyDirectionEnum).optional().or(z.literal("")),
      legalStatus: z.enum(PropertyLegalStatusEnum).optional().or(z.literal("")),
      furniture: z.enum(PropertyFurnitureEnum).optional().or(z.literal("")),
      amenities: z.array(z.string()).optional(),
      images: z.array(z.string()).optional(),
      thumbnail: z.string().optional(),
      videoLink: z.string().optional(),
      virtualTourUrls: z.array(z.string()).optional(),
      description: z.string().optional(),
      status: z.enum(PropertyStatusEnum).optional(),
    })
    .superRefine((body, ctx) => {
      if (body.status === PropertyStatusEnum.DRAFT) {
        return;
      }

      const requiredStringFields = [
        { field: "title", label: "Tiêu đề tin đăng" },
        { field: "province", label: "Tỉnh/Thành phố" },
        { field: "ward", label: "Phường/Xã" },
        { field: "address", label: "Địa chỉ cụ thể" },
        { field: "description", label: "Mô tả" },
      ] as const;

      for (const item of requiredStringFields) {
        const value = body[item.field];

        if (typeof value !== "string" || !value.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [item.field],
            message: requiredMessage(item.label),
          });
        }
      }

      if (!body.demandType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["demandType"],
          message: requiredMessage("Loại giao dịch"),
        });
      }

      if (!body.propertyType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["propertyType"],
          message: requiredMessage("Loại bất động sản"),
        });
      }

      if (body.area === undefined || body.area === null || body.area === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["area"],
          message: requiredMessage("Diện tích"),
        });
      }

      if (body.price === undefined || body.price === null || body.price === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: requiredMessage("Giá"),
        });
      }
    });

  return z.object({
    body: bodySchema,
  });
};

export const aiSearchPropertySchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      query: z.string().trim().min(2, t.required("Nội dung tìm kiếm")),
      limit: z.coerce.number().int().min(1).max(20).optional(),
      page: z.coerce.number().int().min(1).max(50).optional(),
      filters: z
        .object({
          demandType: z.enum(PropertyDemandTypeEnum).optional(),
          propertyType: z.enum(PropertyTypeEnum).optional(),
          province: z.string().trim().optional(),
          district: z.string().trim().optional(),
          ward: z.string().trim().optional(),
          minPrice: z.coerce.number().positive().optional(),
          maxPrice: z.coerce.number().positive().optional(),
          minArea: z.coerce.number().positive().optional(),
          maxArea: z.coerce.number().positive().optional(),
          minBedrooms: z.coerce.number().int().min(0).optional(),
          minBathrooms: z.coerce.number().int().min(0).optional(),
          amenities: z.array(z.string().trim().min(1)).optional(),
        })
        .optional(),
    }),
  });
};
