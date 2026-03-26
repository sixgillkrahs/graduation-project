import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const validateUpdateGeneralSettingsSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      systemName: z.string().min(1, { message: t.required("System name") }),
      adminPortalTitle: z
        .string()
        .min(1, { message: t.required("Admin portal title") }),
      systemTagline: z.string().min(1, { message: t.required("System tagline") }),
      websiteUrl: z.string().url({ message: t.invalidPath }),
      brandColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, {
        message: t.invalidDescription,
      }),
      defaultLanguage: z.enum(["en", "vi"]),
      timezone: z.string().min(1, { message: t.required("Timezone") }),
      currency: z.string().min(1, { message: t.required("Currency") }),
      dateFormat: z.string().min(1, { message: t.required("Date format") }),
      supportEmail: z.string().email({ message: t.email }),
      supportPhone: z.string().min(1, { message: t.required("Support phone") }),
      maintenanceMode: z.boolean(),
      allowPublicRegistration: z.boolean(),
      enableListingReviews: z.boolean(),
    }),
  });
};
