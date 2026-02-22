import { Server } from "http";
import { logger } from "@utils/logger.js";
import { dbDisconnection } from "@/db/db.js";

type ShutdownParams = {
  server?: Server; // HTTP server instance
  redis?: any;  // Redis client instance
};

export const gracefulShutdown = (params: ShutdownParams, options = { timeout: 10000 }) => {
  const { server, redis } = params;
  let isShuttingDown = false;

  return async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`\n${signal} received. Starting graceful shutdown...`);

    // Force exit after a timeout to prevent hanging
    const forceExit = setTimeout(() => {
      logger.error("Shutdown timed out. Forcing exit.");
      process.exit(1);
    }, options.timeout);

    try {
      // 1. Stop accepting new requests
      if (server) {
        logger.info("Closing HTTP server...");
        await new Promise((resolve, reject) => {
          server.close((err) => (err ? reject(err) : resolve("Success")));
        });
        logger.info("HTTP server closed.");
      }
      // 2. Close database connections
      logger.info("Closing database connections...");
      await dbDisconnection();
      logger.info("Database connections closed.");
      // 3. Close Redis/Cache
      if (redis && typeof redis.quit === 'function') {
        logger.info("Disconnecting Redis...");
        await redis.quit();
        logger.info("Redis disconnected.");
      }

      logger.info("Shutdown complete. Goodbye!");
      clearTimeout(forceExit);
      process.exit(0);
    } catch (err) {
      logger.error("Error during shutdown:", err);
      process.exit(1);
    }
  };
};