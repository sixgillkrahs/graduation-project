import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

const createObjectIdSchema = (lang: keyof typeof validationMessages) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.string().refine(
    (id) => {
      if (id.length !== 24) return false;
      return /^[0-9a-fA-F]{24}$/.test(id);
    },
    {
      message: t.invalidId || "Invalid ObjectId format",
    },
  );
};

const validateIdHeaderSchema = (lang: keyof typeof validationMessages) => {
  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
  });
};

export { createObjectIdSchema, validateIdHeaderSchema };
