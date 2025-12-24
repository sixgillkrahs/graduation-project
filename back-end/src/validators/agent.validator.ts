import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const applicationSchema = (lang: keyof typeof validationMessages) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      fullName: z.string({ error: t.required("Họ và tên") }),
      email: z.email({ message: t.email }),
      phoneNumber: z.string({ error: t.required("Số điện thoại") }),
      agentName: z.string({ error: t.required("Tên đại lý") }),
      area: z.array(z.string({ error: t.required("Khu vực") })),
      IDNumber: z.string({ error: t.required("Số CMND/CCCD") }),
      dateOfBirth: z.string({ error: t.required("Ngày sinh") }),
      gender: z.string({ error: t.required("Giới tính") }),
      address: z.string({ error: t.required("Địa chỉ") }),
    }),
  });
};
