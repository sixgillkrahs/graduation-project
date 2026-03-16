import path from "path";
import swaggerJsdoc from "swagger-jsdoc";
import { version } from "../../package.json";

const routeDocsGlob = path.resolve(__dirname, "../routes/*.{ts,js}");

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Express core",
      version,
      description: "API documentation for Express TypeScript Boilerplate",
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      responses: {
        UnauthorizedError: {
          description: "Access token is missing or invalid",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: false },
                  message: { type: "string" },
                  code: { type: "string" },
                },
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [routeDocsGlob],
};

export const specs = swaggerJsdoc(options);
