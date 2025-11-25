import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const createUpdateResourceSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;
    return z.object({
        body: z.object({
            name: z.string({ message: t.invalidName }).min(1, { message: t.invalidName }),
            description: z.optional(z.string({ message: t.invalidDescription }).min(1, { message: t.invalidDescription })),
        }),
    });
};