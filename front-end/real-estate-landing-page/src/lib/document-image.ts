import { getAiBaseUrl } from "@/lib/env-base-url";

const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const resolveDocumentImageUrl = (value?: string | null) => {
  if (!value) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  const aiBaseUrl = getAiBaseUrl();

  return aiBaseUrl ? `${aiBaseUrl}/images/${value}` : value;
};
