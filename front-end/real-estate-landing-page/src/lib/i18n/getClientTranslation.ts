import en from "../../../messages/en.json";
import vi from "../../../messages/vi.json";

const messages: Record<string, Record<string, any>> = { en, vi };

/**
 * Get a translated string outside of React components (e.g. in queryClient, utils).
 * Reads locale from the document cookie.
 *
 * @param key - Dot-notation key, e.g. "notifications.recordSuccess"
 * @returns The translated string, or the key itself as fallback
 */
export function getClientTranslation(key: string): string {
  const locale = getLocaleFromCookie();
  const keys = key.split(".");
  let result: any = messages[locale];

  for (const k of keys) {
    result = result?.[k];
  }

  return typeof result === "string" ? result : key;
}

function getLocaleFromCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
  return match?.[1] || "en";
}
