import { Request, Response, NextFunction } from "express";
import { AppError } from "@/utils/appError";
import { ApiResponse } from "@/utils/apiResponse";
import { logger } from "@/config/logger";
import { MetricsService } from "@/services/metrics.service";
import { validationMessages } from "@/i18n/validationMessages";

const metricsService = new MetricsService();

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const code = error instanceof AppError ? error.code : "INTERNAL_SERVER_ERROR";
  logger.error({
    message: error.message,
    stack: error.stack,
    context: "ErrorHandler",
    code: code,
  });
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const route = req.route?.path || req.path || "/unknown";

  metricsService.recordHttpRequest(req.method, route, statusCode, 0);

  if (error instanceof AppError) {
    ApiResponse.error(res, error.message, error.statusCode, code);
    return;
  }

  const lang = req.lang || "vi";
  const internalErrorMsg =
    validationMessages[lang]?.error || "Internal server error";

  ApiResponse.error(
    res,
    `${internalErrorMsg}: ${error.message}`,
    500,
    undefined,
    error.stack,
  );
};
