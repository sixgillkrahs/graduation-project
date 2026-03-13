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
  AI_SERVICE_URL: z.string().url().optional().default("http://localhost:8081"),
  REVIEW_MODERATION_INTERVAL_MS: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .default(300000),
  REVIEW_MODERATION_BATCH_SIZE: z.coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(25),
  // PROMETHEUS_URL: z.string().url().optional().default('http://localhost:9090'),
  MESSAGE_ENCRYPTION_KEY: z
    .string()
    .min(32)
    .default("01234567890123456789012345678901"),
  // Google API
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
  // Qdrant
  QDRANT_URL: z.string(),
  QDRANT_API_KEY: z.string(),
  QDRANT_COLLECTION: z.string(),
  // Gemini API
  GEMINI_API_KEY: z.string(),
  REVIEW_REPLY_GEMINI_MODEL: z
    .string()
    .optional()
    .default("gemini-2.0-flash"),
  // VNPay
  VNP_TMN_CODE: z.string().optional().default("CGXZLS0Z"),
  VNP_HASH_SECRET: z
    .string()
    .optional()
    .default("XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN"),
  VNP_URL: z
    .string()
    .url()
    .optional()
    .default("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html"),
  VNP_RETURN_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000/agent/upgrade/success"),
  // MoMo
  MOMO_PARTNER_CODE: z.string().optional().default("MOMOBKUN20180529"),
  MOMO_ACCESS_KEY: z.string().optional().default("klm05TvNCpectD98"),
  MOMO_SECRET_KEY: z
    .string()
    .optional()
    .default("at67qH6mk8g5i1peYrvjok4bAY6P4SGE"),
  MOMO_URL: z
    .string()
    .url()
    .optional()
    .default("https://test-payment.momo.vn/v2/gateway/api/create"),
  MOMO_RETURN_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:3000/agent/upgrade/success"),
  MOMO_NOTIFY_URL: z
    .string()
    .url()
    .optional()
    .default("https://your-domain.ngrok-free.app/api/payment/momo_ipn"),
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
