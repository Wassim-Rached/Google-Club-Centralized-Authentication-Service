import { Server } from "http";
import { closePool } from "./utils/db";

// Function to handle graceful shutdown
export function setupGracefulShutdown(server: Server) {
  const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);

    server.close(async (err) => {
      if (err) {
        console.error("Error closing server:", err);
      } else {
        console.log("Server closed gracefully");
      }

      try {
        await closePool();
        console.log("Database connection pool closed");
        process.exit(0);
      } catch (error) {
        console.error("Error closing database connection pool:", error);
        process.exit(1);
      }
    });
  };

  // Set up listeners for each signal
  signals.forEach((signal) => {
    process.on(signal, () => shutdown(signal));
  });

  // Handle uncaught exceptions and unhandled rejections
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    console.error("Unhandled Rejection:", reason);
    shutdown("unhandledRejection");
  });
}
