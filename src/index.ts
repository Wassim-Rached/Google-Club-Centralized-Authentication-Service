import express from "express";
import dotenv from "dotenv";
import { handleRoutes } from "./routers";
import { closePool } from "./utils/db";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

handleRoutes(app);

const server = app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close((err) => {
    if (err) {
      console.error("Error closing server:", err);
    } else {
      console.log("Server closed gracefully");
    }

    // Close the database connection pool
    closePool()
      .then(() => {
        console.log("Database connection pool closed");
        process.exit(0);
      })
      .catch((error: any) => {
        console.error("Error closing database connection pool:", error);
        process.exit(1);
      });
  });
});
