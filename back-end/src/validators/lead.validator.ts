import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";
import { createObjectIdSchema } from "./base.validator";

const interestTopicSchema = z.enum([
  "PRICE",
  "LEGAL",
  "LOCATION",
  "NEGOTIATION",
  "VIEWING",
  "FURNITURE",
  "PAYMENT",
]);

export const validateCreateLeadSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      listingId: createObjectIdSchema(lang),
      customerName: z.string({ message: t.invalidName }).trim().min(2).max(120),
      customerPhone: z
        .string({ message: t.phoneInvalid })
        .trim()
        .min(8, { message: t.phoneInvalid })
        .max(20, { message: t.phoneInvalid }),
      customerEmail: z
        .union([z.string().email({ message: t.email }), z.literal("")])
        .optional(),
      intent: z.enum(["BUY_TO_LIVE", "INVEST", "RENT", "CONSULTATION"]),
      interestTopics: z.array(interestTopicSchema).min(1).max(6),
      budgetRange: z.string({ message: t.required("budgetRange") }).trim().min(1).max(100),
      preferredContactTime: z.enum([
        "ASAP",
        "TODAY",
        "NEXT_24_HOURS",
        "THIS_WEEKEND",
      ]),
      preferredContactChannel: z.enum(["PHONE", "CHAT", "ZALO", "EMAIL"]),
      source: z
        .enum(["PROPERTY_CALL", "PROPERTY_CHAT", "PROPERTY_REQUEST"])
        .optional(),
      message: z.string().trim().max(1000).optional(),
      website: z.string().trim().max(120).optional(),
    }),
  });
};

export const validateUpdateLeadStatusSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
    body: z.object({
      status: z.enum(
        ["NEW", "CONTACTED", "QUALIFIED", "SCHEDULED", "WON", "LOST"],
        {
          message: t.required("status"),
        },
      ),
    }),
  });
};
