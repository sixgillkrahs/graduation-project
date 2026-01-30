import app from "@/app";
import { ENV } from "./config/env";
import { logger } from "./config/logger";
const PORT = process.env.PORT || 8080;
import mongoDB from "@/config/database";
import { WebSocketService } from "@/services/websocket.service";

// Connect to MongoDB
mongoDB.connect();

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${ENV.PORT} in ${ENV.NODE_ENV} mode`);
});

const instance = WebSocketService.getInstance(server);

// Initialize Email Worker
import { EmailService } from "@/services/email.service";
import { EmailWorker } from "@/workers/email.worker";
const emailService = new EmailService();
new EmailWorker(emailService);

// Lắng nghe message từ client
// wsService.onMessage((ws, msg) => {
//   if (msg.type === 'ping') {
//     wsService.send(ws, { type: 'pong', data: Date.now() });
//   }
// });

const shutdown = async () => {
  logger.info("Shutdown signal received");

  const wsService = WebSocketService.getInstance();
  // wsService.broadcast({ type: 'shutdown', data: { message: 'Server shutting down' } });

  // Add connection draining
  app.disable("connection"); // Stop accepting new connections

  // Add timeout for existing connections
  const connectionDrainTimeout = setTimeout(() => {
    logger.warn("Connection drain timeout reached, forcing shutdown");
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info("HTTP server closed");

    try {
      await mongoDB.disconnect();
      logger.info("Database connections closed");

      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown:", err);
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 30000);
};

// Ví dụ 5 giây broadcast cho tất cả client
setInterval(() => {
  // wsService.broadcast({
  //   type: 'connection',
  //   data: { time: new Date().toISOString() }
  // });
}, 5000);

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

export default server;
