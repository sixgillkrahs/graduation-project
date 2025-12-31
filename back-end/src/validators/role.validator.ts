import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";
import { createObjectIdSchema } from "./base.validator";

export const validateBodyRoleSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.object({
    body: z.object({
      name: z
        .string({ message: t.invalidName })
        .min(1, { message: t.invalidName }),
      code: z
        .string({ message: t.invalidName })
        .min(1, { message: t.invalidName }),
      permissionIds: z.array(createObjectIdSchema(lang)),
      description: z.optional(z.string({ message: t.invalidDescription })),
      isActive: z.optional(z.boolean()),
      isDefault: z.optional(z.boolean()),
    }),
  });
};

export const validateIdHeaderSchema = (
  lang: keyof typeof validationMessages,
) => {
  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
  });
};
