import { validationMessages } from "@/i18n/validationMessages";
import { Request } from "express";


export class ApiRequest {
    static getCurrentLang(req: Request): keyof typeof validationMessages {
        return req.cookies?.lang || req.headers["accept-language"]?.split(",")[0] || "vi";
    }
}   