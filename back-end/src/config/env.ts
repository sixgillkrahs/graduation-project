import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  DATABASE_URL: z.string(),
  REDIS_URL: z.string(),
  REDIS_PORT: z.string(),
  REDIS_HOST: z.string(),
  REDIS_PASS: z.string(),
  REDIS_DB: z.string(),
  PORT: z
    .string()
    .transform(Number)
    .refine((n) => n >= 1024 && n <= 65535, {
      message: "Port must be between 1024 and 65535",
    }),
  NODE_ENV: z.enum(["development", "production", "test"]),
  JWT_SECRET: z.string().min(32),
  REFRESH_TOKEN_SECRET: z.string().min(32),
  JWT_EXPIRY: z.string().regex(/^\d+[smhd]$/),
  PASS_INIT: z.string().min(6),
  // REFRESH_TOKEN_EXPIRY: z.string().regex(/^\d+[smhd]$/),
  JWT_SECRET_LANDING_PAGE: z.string().min(32),
  FRONTEND_URL: z.url(),
  FRONTEND_URLLANDINGPAGE: z.url(),
  SMTP_HOST:
    process.env.NODE_ENV === "development" ? z.string().optional() : z.string(),
  SMTP_PORT:
    process.env.NODE_ENV === "development"
      ? z.string().transform(Number).optional()
      : z.string().transform(Number),
  SMTP_USER:
    process.env.NODE_ENV === "development" ? z.string().optional() : z.string(),
  SMTP_PASSWORD:
    process.env.NODE_ENV === "development" ? z.string().optional() : z.string(),
  SMTP_FROM:
    process.env.NODE_ENV === "development"
      ? z.string().email().optional()
      : z.string().email(),
  APP_NAME:
    process.env.NODE_ENV === "development"
      ? z.string().optional().default("Express Boilerplate")
      : z.string(),
  SERVER_URL: z.url(),
  // PROMETHEUS_URL: z.string().url().optional().default('http://localhost:9090'),
  MESSAGE_ENCRYPTION_KEY: z.string().min(32).default("01234567890123456789012345678901"),
});
export const ENV = envSchema.parse(process.env);
if (process.env.NODE_ENV === "production") {
  const requiredFields = [
    "SMTP_HOST",
    "SMTP_PORT",
    "SMTP_USER",
    "SMTP_PASSWORD",
  ];

  requiredFields.forEach((field) => {
    if (!process.env[field]) {
      throw new Error(`Missing required env variable: ${field}`);
    }
  });
}
