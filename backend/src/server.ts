import { app } from "@/app.js";
import { gracefulShutdown } from "@utils/shutdown.js";
import { env } from "@configs/env.js";
import { logger } from "@utils/logger.js";
import { db } from "./db/db.js";
(async () => {
    try {
      // Test the connection before starting the server
    logger.info("Checking database connection...");
    await db.execute("SELECT 1"); 
    logger.info("Database connection established.");
      const server = app.listen(env.PORT, () => {
        logger.info(`Server is running on port ${env.PORT}`);
      });
      const shutdownHandler = gracefulShutdown({ server });
    // Handle termination signals and unexpected errors
    process.on('SIGINT', shutdownHandler);
    process.on('SIGTERM', shutdownHandler);
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught Exception:', err);
      shutdownHandler('uncaughtException');
    });
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      shutdownHandler('unhandledRejection');
    });
    } catch (error: any) {
      logger.error(`Server initialization failed: ${error.message}`);
      process.exit(1);
    }
  
})();