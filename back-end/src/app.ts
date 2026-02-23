import monitoringRoutes from "@/routes/monitoring.routes";
import userRoutes from "@/routes/user.routes";
import { WebSocketService } from "@/services/websocket.service";
import cors from "cors";
import express, { ErrorRequestHandler } from "express";
import swaggerUi from "swagger-ui-express";
import { ENV } from "./config/env";
import { specs } from "./docs/swagger";
import { cache } from "./middleware/cacheMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import { loggingMiddleware } from "./middleware/loggingMiddleware";
import { metricsMiddleware } from "./middleware/monitoringMiddleware";
import { notFoundHandler } from "./middleware/notFound";
import { compressionMiddleware } from "./middleware/performanceMiddleware";
import { authLimiter } from "./middleware/rateLimiter";
import { requestId } from "./middleware/requestId";
import { setupSecurityHeaders } from "./middleware/securityHeaders";
import { langMiddleware } from "./middleware/langMiddleware";
import authRoutes from "./routes/auth.routes";
import permissionRoutes from "./routes/permission.routes";
import resourcesRoutes from "./routes/resource.routes";

import agentsRegistrationsRoutes from "./routes/agents-registrations.routes";
import agentRoutes from "./routes/agents.routes";
import chatRoutes from "./routes/chat.routes";
import propertyRoutes from "./routes/property.routes";
import noticeRoutes from "./routes/notice.routes";
import roleRoutes from "./routes/role.routes";
import uploadRoutes from "./routes/upload.routes";
import landlordRoutes from "./routes/landlord.routes";
import scheduleRoutes from "./routes/schedule.routes";

const app = express();

const setupMiddleware = (app: express.Application) => {
  // Security
  app.use(requestId);
  app.use(langMiddleware);
  app.use((req, res, next) => {
    const io = WebSocketService.getInstance().getWss();
    if (io) {
      req.io = io;
    }
    next();
  });
  setupSecurityHeaders(app as express.Express);
  app.use(
    cors({
      origin: [ENV.FRONTEND_URL, ENV.FRONTEND_URLLANDINGPAGE],
      credentials: true,
    }),
  );

  // Performance
  app.use(compressionMiddleware);
  app.use(
    express.json({
      limit: "10kb",
    }),
  );

  //Upload
  app.use(express.static("public"));

  // Monitoring
  app.use(loggingMiddleware);
  app.use(metricsMiddleware);

  // Rate Limiting
  app.use("/api/auth", authLimiter);
  // app.use("/api", apiLimiter);
};

setupMiddleware(app);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
  });
});
app.use("/api/upload", uploadRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/resources", resourcesRoutes);
app.use("/api/agents-registrations", agentsRegistrationsRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/landlords", landlordRoutes);
app.use("/api/schedules", scheduleRoutes);

const swaggerOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: "none",
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Express TypeScript Core",
};

app.use("/api/monitoring", monitoringRoutes);

app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(specs, swaggerOptions));

const errorMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  return errorHandler(err, req, res, next);
};

app.use(errorMiddleware);
app.use("/api/users", cache({ duration: 300 }));
app.use("/monitoring", monitoringRoutes);
// Add this as the last middleware (before error handler)
app.use(notFoundHandler);

export default app;
