import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const createUserSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;

    return z.object({
        body: z.object({
            email: z.string({ error: t.required("Email") })
                .email({ message: t.email })
                .max(99, { message: t.emailMax }),

            firstname: z.string({ error: t.required("Họ") })
                .max(16, { message: t.firstnameMax }),

            lastname: z.string({ error: t.required("Tên") })
                .max(16, { message: t.lastnameMax }),

            phone: z.string({ error: t.required("Số điện thoại") })
                .length(10, { message: t.phoneLength })
                .regex(/^[0-9]+$/, { message: t.phoneInvalid }),
        }),
    });
};