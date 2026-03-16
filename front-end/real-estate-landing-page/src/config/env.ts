import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Run time server side environment variables.
   * Can't be accessed on the client.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    INTERNAL_API_BASE_URL: z.string().url().optional(),
    INTERNAL_AI_BASE_URL: z.string().url().optional(),
  },

  /**
   * Client side environment variables.
   * To expose these to the client, you must prefix them with `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_API_BASE_URL: z.string().url(),
    NEXT_PUBLIC_API_BASE_SOCKET: z.string().url().optional(),
    NEXT_PUBLIC_BASEURLAI: z.string().url().optional(),
    NEXT_PUBLIC_ENVIRONMENT: z
      .enum(["development", "production", "test"])
      .default("development"),
    NEXT_PUBLIC_ANALYTICS_ID: z.string().optional(),
    NEXT_PUBLIC_MODERATION_API_URL: z.string().url().optional(),
  },

  /**
   * For Next.js >= 13.4.4, you only need to destructure client variables:
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    INTERNAL_API_BASE_URL: process.env.INTERNAL_API_BASE_URL,
    INTERNAL_AI_BASE_URL: process.env.INTERNAL_AI_BASE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_API_BASE_SOCKET: process.env.NEXT_PUBLIC_API_BASE_SOCKET,
    NEXT_PUBLIC_BASEURLAI: process.env.NEXT_PUBLIC_BASEURLAI,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NEXT_PUBLIC_ENVIRONMENT,
    NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    NEXT_PUBLIC_MODERATION_API_URL: process.env.NEXT_PUBLIC_MODERATION_API_URL,
  },

  /**
   * Skip validation if passing SKIP_ENV_VALIDATION="true" (e.g., during build)
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  /**
   * Treat empty strings as undefined
   */
  emptyStringAsUndefined: true,
});
