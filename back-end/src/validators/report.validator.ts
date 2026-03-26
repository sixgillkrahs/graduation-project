import {
  ReportReasonEnum,
  ReportStatusEnum,
  ReportTargetTypeEnum,
} from "@/models/report.model";
import { validationMessages } from "@/i18n/validationMessages";
import { createObjectIdSchema } from "./base.validator";
import { z } from "zod";

export const validateCreateReportSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      targetType: z.nativeEnum(ReportTargetTypeEnum, {
        message: t.required("targetType"),
      }),
      targetId: createObjectIdSchema(lang),
      reason: z.nativeEnum(ReportReasonEnum, {
        message: t.required("reason"),
      }),
      details: z.string().trim().max(1000).optional(),
    }),
  });
};

export const validateResolveReportSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
    body: z.object({
      status: z.enum(
        [ReportStatusEnum.CONFIRMED, ReportStatusEnum.DISMISSED],
        {
          message: t.required("status"),
        },
      ),
      adminNote: z.string().trim().max(1000).optional(),
    }),
  });
};
