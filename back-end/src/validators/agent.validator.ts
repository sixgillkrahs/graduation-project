import { validationMessages } from "@/i18n/validationMessages";
import { createObjectIdSchema } from "./base.validator";
import { z } from "zod";

export const applicationSchema = (lang: keyof typeof validationMessages) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      nameRegister: z.string().min(1, t.required("Họ và tên")),
      email: z.email(t.email),
      phoneNumber: z.string().min(1, t.required("Số điện thoại")),
      identityFront: z.string().min(1, t.required("Ảnh CCCD mặt trước")),
      identityBack: z.string().min(1, t.required("Ảnh CCCD mặt sau")),
      identityInfo: z.object({
        IDNumber: z.string().min(1, t.required("Số CMND/CCCD")),
        fullName: z.string().min(1, t.required("Họ và tên")),
        dateOfBirth: z.string().min(1, t.required("Ngày sinh")),
        gender: z.string().min(1, t.required("Giới tính")),
        nationality: z.string().min(1, t.required("Quốc tịch")),
        placeOfBirth: z.string().min(1, t.required("Nơi Sinh")),
      }),
      certificateNumber: z.string().min(1, t.required("Số chứng chỉ")),
      certificateImage: z.array(z.string()).min(1, t.required("Ảnh chứng chỉ")),
      specialization: z.array(z.string()).min(1, t.required("Chuyên môn")),
      workingArea: z.array(z.string()).min(1, t.required("Khu vực làm việc")),
      taxCode: z.string().min(1, t.required("Mã số thuế")),
      yearsOfExperience: z.string().min(1, t.required("Số năm kinh nghiệm")),
      agreeToTerms: z.literal(true, {
        error: t.required("Bạn phải đồng ý điều khoản"),
      }),
    }),
  });
};

export const lockAccountSchema = (lang: keyof typeof validationMessages) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
    body: z
      .object({
        lockType: z.enum(["TEMPORARY", "PERMANENT"]),
        lockUntil: z.string().optional(),
        reason: z.string().trim().min(1, t.required("Lý do khóa")).max(500),
      })
      .superRefine((body, ctx) => {
        if (body.lockType === "TEMPORARY" && !body.lockUntil?.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["lockUntil"],
            message: t.required("Ngày khóa"),
          });
        }
      }),
  });
};

export const accountLockAppealTokenSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      token: z.string().trim().min(1, t.required("Token")),
    }),
  });
};

export const submitAccountLockAppealSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      token: z.string().trim().min(1, t.required("Token")),
      reason: z.string().trim().min(1, t.required("Nội dung giải trình")).max(2000),
      contactEmail: z.union([z.literal(""), z.email(t.email)]).optional(),
    }),
  });
};
