import { parse } from "cookie";
import { Request, Response, NextFunction } from "express";

export const langMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let lang = "vi";

  if (req.headers.cookie) {
    const cookies = parse(req.headers.cookie);
    lang = cookies.locale || "vi";
  } else if (req.headers["accept-language"]) {
    const acceptLang = req.headers["accept-language"];
    if (acceptLang.includes("vi")) {
      lang = "vi";
    } else if (acceptLang.includes("en")) {
      lang = "en";
    }
  }

  req.lang = lang as "vi" | "en";
  next();
};
