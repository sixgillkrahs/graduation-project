import { validationMessages } from "@/i18n/validationMessages";
import { z } from "zod";

export const getPermissionByIdSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;
    return z.object({
        params: z.object({
            id: z.uuid({ message: t.invalidId }),
        }),
    });
};

export const createPermissionSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;
    return z.object({
        body: z.object({
            name: z.string({ message: t.invalidName }),
            description: z.string({ message: t.invalidDescription }),
            resourceId: z.string({ message: t.invalidId }),
            operationId: z.string({ message: t.invalidId }),
        }),
    });
};

export const updatePermissionSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;
    return z.object({
        params: z.object({
            id: z.uuid({ message: t.invalidId }),
        }),
        body: z.object({
            name: z.string({ message: t.invalidName }),
            description: z.string({ message: t.invalidDescription }),
            resourceId: z.string({ message: t.invalidId }),
            operationId: z.string({ message: t.invalidId }),
        }),
    });
};

export const deletePermissionSchema = (lang: keyof typeof validationMessages) => {
    const t = validationMessages[lang] || validationMessages.vi;
    return z.object({
        params: z.object({
            id: z.uuid({ message: t.invalidId }),
        }),
    });
};
