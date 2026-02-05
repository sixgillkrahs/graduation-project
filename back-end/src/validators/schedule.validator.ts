import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";
import { createObjectIdSchema } from "./base.validator";

export const validateBodyScheduleSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.object({
    body: z.object({
      userId: z.optional(createObjectIdSchema(lang)),
      listingId: z.optional(createObjectIdSchema(lang)),
      title: z.string({ message: t.required("title") }),
      customerName: z
        .string({ message: t.invalidName })
        .min(1, { message: t.invalidName }),
      customerPhone: z
        .string({ message: t.phoneInvalid })
        .min(1, { message: t.phoneInvalid }),
      customerEmail: z
        .string({ message: t.email })
        .min(1, { message: t.email }),
      startTime: z.coerce.date({ message: t.required("startTime") }),
      endTime: z.coerce.date({ message: t.required("endTime") }),
      location: z
        .string({ message: t.required("location") })
        .min(1, { message: t.required("location") }),
      type: z.enum(["VIEWING", "MEETING", "CALL"], {
        message: t.required("type"),
      }),
      status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"], {
        message: t.required("status"),
      }),
      customerNote: z.optional(
        z.string({ message: t.required("customerNote") }),
      ),
      agentNote: z.optional(z.string({ message: t.required("agentNote") })),
    }),
  });
};
