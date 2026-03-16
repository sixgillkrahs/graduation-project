const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const getApiBaseUrl = () => {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.INTERNAL_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL;

  return trimTrailingSlash(baseUrl || "");
};

export const getAiBaseUrl = () => {
  const baseUrl =
    typeof window === "undefined"
      ? process.env.INTERNAL_AI_BASE_URL || process.env.NEXT_PUBLIC_BASEURLAI
      : process.env.NEXT_PUBLIC_BASEURLAI;

  return trimTrailingSlash(baseUrl || "");
};
