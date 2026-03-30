import { ENV } from "@/config/env";
import { parse } from "cookie";
import { Request, Response } from "express";

export type AuthApp = "landing" | "uaa";

type AuthCookieNames = {
  accessToken: string;
  refreshToken: string;
};

const AUTH_COOKIE_NAMES: Record<AuthApp, AuthCookieNames> = {
  landing: {
    accessToken: "landing_accessToken",
    refreshToken: "landing_refreshToken",
  },
  uaa: {
    accessToken: "uaa_accessToken",
    refreshToken: "uaa_refreshToken",
  },
};

const LEGACY_COOKIE_NAMES: AuthCookieNames = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
};

const getCookieOptions = () => {
  const isProduction = ENV.NODE_ENV === "production";
  const sameSite: "none" | "lax" = isProduction ? "none" : "lax";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: "/",
  };
};

export const resolveAuthApp = (req: Request): AuthApp => {
  const explicitApp = req.headers["x-auth-app"];

  if (explicitApp === "landing" || explicitApp === "uaa") {
    return explicitApp;
  }

  const requestSource =
    String(req.headers.origin || "") || String(req.headers.referer || "");

  if (requestSource.startsWith(ENV.FRONTEND_URL)) {
    return "uaa";
  }

  return "landing";
};

export const parseRequestCookies = (req: Request) => {
  const cookieHeader = req.headers.cookie;

  if (!cookieHeader) {
    return {};
  }

  return parse(cookieHeader);
};

export const getAuthCookieNames = (req: Request): AuthCookieNames => {
  return AUTH_COOKIE_NAMES[resolveAuthApp(req)];
};

export const getAccessTokenFromRequest = (req: Request) => {
  const cookies = parseRequestCookies(req);
  const { accessToken } = getAuthCookieNames(req);

  return cookies[accessToken] || cookies[LEGACY_COOKIE_NAMES.accessToken];
};

export const getRefreshTokenFromRequest = (req: Request) => {
  const cookies = parseRequestCookies(req);
  const { refreshToken } = getAuthCookieNames(req);

  return cookies[refreshToken] || cookies[LEGACY_COOKIE_NAMES.refreshToken];
};

export const setAuthCookies = (
  req: Request,
  res: Response,
  accessToken: string,
  refreshToken: string,
  rememberMe?: boolean,
) => {
  const { accessToken: accessCookieName, refreshToken: refreshCookieName } =
    getAuthCookieNames(req);
  const cookieOptions = getCookieOptions();

  res.cookie(
    accessCookieName,
    accessToken,
    rememberMe
      ? {
          ...cookieOptions,
          maxAge: 15 * 60 * 1000,
        }
      : cookieOptions,
  );
  res.cookie(
    refreshCookieName,
    refreshToken,
    rememberMe
      ? {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60 * 1000,
        }
      : cookieOptions,
  );
};

export const clearAuthCookies = (req: Request, res: Response) => {
  const currentCookieNames = getAuthCookieNames(req);
  const cookieNames = [
    currentCookieNames.accessToken,
    currentCookieNames.refreshToken,
    LEGACY_COOKIE_NAMES.accessToken,
    LEGACY_COOKIE_NAMES.refreshToken,
  ];
  const cookieOptions = getCookieOptions();

  for (const cookieName of cookieNames) {
    res.cookie(cookieName, "", {
      ...cookieOptions,
      expires: new Date(0),
    });
  }
};
