const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const resolveDocumentImageUrl = (value?: string | null) => {
  if (!value) {
    return "";
  }

  if (ABSOLUTE_URL_PATTERN.test(value)) {
    return value;
  }

  const aiBaseUrl = trimTrailingSlash(import.meta.env.VITE_BASEURL_AI || "");

  return aiBaseUrl ? `${aiBaseUrl}/images/${value}` : value;
};
