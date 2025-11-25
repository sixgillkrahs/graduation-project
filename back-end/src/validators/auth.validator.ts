import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const loginSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;

    return z.object({
        body: z.object({
            username: z.string({ error: t.required("Tên đăng nhập") }),
            password: z.string({ error: t.required("Mật khẩu") }).min(6, { message: t.passwordMin }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, { message: t.passwordInvalid }),
            rememberMe: z.boolean().optional(),
        }),
    });
}

export const signupSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;

    return z.object({
        body: z.object({
            username: z.string({ error: t.required("Tên đăng nhập") }),
            password: z.string({ error: t.required("Mật khẩu") }).min(6, { message: t.passwordMin }).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/, { message: t.passwordInvalid }),
            confirmPassword: z.string({ error: t.required("Xác nhận mật khẩu") }),
            email: z.email({ message: t.invalidEmail }),
            firstName: z.string({ error: t.required(t.invalidFirstName) }).max(16, t.firstnameMax),
            lastName: z.string({ error: t.required(t.invalidLastName) }).max(16, t.lastnameMax),
            phone: z.string({ error: t.required(t.phoneInvalid) }),
        }),
    });
}
