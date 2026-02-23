import { Request, Response, NextFunction } from "express";
import { ApiRequest } from "@/utils/apiRequest";
import { parse } from "cookie";
import { validationMessages } from "@/i18n/validationMessages";

export const langMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = parse(cookieHeader);
    if (cookies.locale) {
      req.lang = cookies.locale as keyof typeof validationMessages;
      next();
    }
  }
  const acceptLanguage = req.headers["accept-language"] || "";
  const languages = acceptLanguage
    .split(",")
    .map((l) => l.split(";")[0].trim().substring(0, 2).toLowerCase());

  for (const lang of languages) {
    if (lang === "en" || lang === "vi") {
      req.lang = lang as keyof typeof validationMessages;
      next();
    }
  }
  next();
};
