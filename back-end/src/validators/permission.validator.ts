import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";
import { createObjectIdSchema } from "./base.validator";

export const getPermissionByIdSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
  });
};

export const createPermissionSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.object({
    body: z.object({
      name: z.string({ message: t.invalidName }),
      description: z.string().optional(),
      resourceId: createObjectIdSchema(lang),
      isActive: z.boolean().default(true),
      operation: z.enum(
        ["read", "create", "update", "delete", "approve", "export"],
        {
          message: t.invalidOperation,
        },
      ),
    }),
  });
};

export const updatePermissionSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
    body: z.object({
      name: z.string({ message: t.invalidName }),
      description: z.string({ message: t.invalidDescription }),
      resourceId: createObjectIdSchema(lang),
      operation: z.enum(
        ["read", "create", "update", "delete", "approve", "export"],
        {
          message: t.invalidOperation,
        },
      ),
    }),
  });
};

export const deletePermissionSchema = (
  lang: keyof typeof validationMessages,
) => {
  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
  });
};

export const updatePermissionStatusSchema = (
  lang: keyof typeof validationMessages,
) => {
  const t = validationMessages[lang] || validationMessages.vi;
  return z.object({
    params: z.object({
      id: createObjectIdSchema(lang),
    }),
    body: z.object({
      isActive: z.boolean({ message: t.invalidIsActive }),
    }),
  });
};
