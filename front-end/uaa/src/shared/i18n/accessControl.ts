import type { TFunction } from "i18next";
import i18n from "@/i18n";

const resourcePathKeyMap: Record<string, string> = {
  "/api/auth": "auth",
  "/api/users": "users",
  "/api/roles": "roles",
  "/api/permissions": "permissions",
  "/api/resources": "resources",
  "/api/agents-registrations": "agentRegistrations",
  "/api/agents": "agents",
  "/api/properties": "properties",
  "/api/reviews": "reviews",
  "/api/reports": "reports",
  "/api/jobs": "jobs",
  "/api/leads": "leads",
  "/api/landlords": "landlords",
  "/api/schedules": "schedules",
  "/api/notices": "notices",
  "/api/chat": "chat",
  "/api/upload": "uploads",
  "/api/payment": "payments",
  "/api/monitoring": "monitoring",
};

type ResourceLike = {
  name?:
    | string
    | {
        en?: string;
        vi?: string;
      };
  path?: string;
};

type PermissionLike = {
  name?:
    | string
    | {
        en?: string;
        vi?: string;
      };
  operation?: string;
  resourceId?: string | ResourceLike;
};

const getCurrentLanguage = () =>
  i18n.resolvedLanguage?.startsWith("vi") ? "vi" : "en";

const getLocalizedText = (
  value:
    | string
    | {
        en?: string;
        vi?: string;
      }
    | undefined,
) => {
  if (!value) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  const language = getCurrentLanguage();

  return value[language] || value.en || value.vi || "";
};

const getResourceTranslationKey = (path?: string) => {
  if (!path) {
    return null;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const key = resourcePathKeyMap[normalizedPath];

  return key ? `accessControl.resources.${key}` : null;
};

export const getLocalizedResourceLabel = (
  resource: string | ResourceLike | undefined,
  t: TFunction,
) => {
  if (!resource) {
    return "-";
  }

  if (typeof resource === "string") {
    const translationKey = getResourceTranslationKey(resource);

    return translationKey ? t(translationKey) : resource;
  }

  const translationKey = getResourceTranslationKey(resource.path);

  if (translationKey) {
    return t(translationKey);
  }

  return getLocalizedText(resource.name) || resource.path || "-";
};

export const getLocalizedOperationLabel = (
  operation: string | undefined,
  t: TFunction,
) => {
  if (!operation) {
    return "-";
  }

  return t(`accessControl.operations.${operation}`, {
    defaultValue: operation,
  });
};

export const getLocalizedPermissionLabel = (
  permission: PermissionLike,
  t: TFunction,
) => {
  const resource =
    typeof permission.resourceId === "object" ? permission.resourceId : undefined;

  if (permission.operation && resource) {
    return `${getLocalizedOperationLabel(permission.operation, t)} ${getLocalizedResourceLabel(
      resource,
      t,
    )}`;
  }

  return getLocalizedText(permission.name) || "-";
};
