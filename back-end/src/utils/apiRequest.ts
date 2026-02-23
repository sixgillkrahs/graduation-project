import { validationMessages } from "@/i18n/validationMessages";
import { Request } from "express";
import { parse } from "cookie";

export class ApiRequest {
  static getCurrentLang(req: Request): keyof typeof validationMessages {
    const cookieHeader = req.headers.cookie;
    if (cookieHeader) {
      const cookies = parse(cookieHeader);
      if (cookies.locale) {
        return cookies.locale as keyof typeof validationMessages;
      }
    }
    const acceptLanguage = req.headers["accept-language"] || "";
    const languages = acceptLanguage
      .split(",")
      .map((l) => l.split(";")[0].trim().substring(0, 2).toLowerCase());

    for (const lang of languages) {
      if (lang === "en" || lang === "vi") {
        return lang as keyof typeof validationMessages;
      }
    }

    return "vi";
  }
}
