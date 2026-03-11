import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const validateReviewInvitationSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      token: z.string({ message: t.required("token") }).min(16),
    }),
  });
};

export const validateCreateReviewSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    body: z.object({
      token: z.string({ message: t.required("token") }).min(16),
      rating: z.coerce.number().min(1).max(5),
      tags: z.array(z.string()).max(10).default([]),
      comment: z.string().max(2000).optional(),
    }),
  });
};

export const validateGetPublicReviewsSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      agentUserId: z.string({ message: t.required("agentUserId") }).min(8),
    }),
    query: z.object({
      page: z.coerce.number().min(1).optional(),
      limit: z.coerce.number().min(1).max(50).optional(),
    }),
  });
};

export const validateGetMyReviewsSchema = (
  lang: keyof typeof validationMessages,
) => {
  return z.object({
    query: z.object({
      page: z.coerce.number().min(1).optional(),
      limit: z.coerce.number().min(1).max(50).optional(),
      search: z.string().max(200).optional(),
      filter: z
        .enum(["all", "5star", "1-3star", "unanswered"])
        .optional(),
    }),
  });
};

export const validateGetAdminReviewQueueSchema = (
  lang: keyof typeof validationMessages,
) => {
  return z.object({
    query: z.object({
      page: z.coerce.number().min(1).optional(),
      limit: z.coerce.number().min(1).max(50).optional(),
      search: z.string().max(200).optional(),
    }),
  });
};

export const validateReplyReviewSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      reviewId: z.string({ message: t.required("reviewId") }).min(8),
    }),
    body: z.object({
      reply: z.string({ message: t.required("reply") }).trim().min(1).max(2000),
    }),
  });
};

export const validateGenerateAutoReplySchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      reviewId: z.string({ message: t.required("reviewId") }).min(8),
    }),
  });
};

export const validateApplyAutoReplySchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      reviewId: z.string({ message: t.required("reviewId") }).min(8),
    }),
    body: z.object({
      reply: z.string().trim().max(2000).optional(),
    }),
  });
};

export const validateDiscardAutoReplySchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      reviewId: z.string({ message: t.required("reviewId") }).min(8),
    }),
  });
};

export const validateReportReviewSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      reviewId: z.string({ message: t.required("reviewId") }).min(8),
    }),
    body: z.object({
      reason: z.string().trim().max(500).optional(),
    }),
  });
};

export const validateAdminReviewDecisionSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;

  return z.object({
    params: z.object({
      reviewId: z.string({ message: t.required("reviewId") }).min(8),
    }),
    body: z.object({
      note: z.string().trim().max(1000).optional(),
    }),
  });
};
