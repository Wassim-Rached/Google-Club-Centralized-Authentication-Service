import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import { handleRoutes } from "./routers";
import config from "./config";
import { corsOptions } from "./cors";
import { errorHandlingMiddleware, timeoutMiddleware } from "./middlewares";
import { setupGracefulShutdown } from "./gracefulShutdown";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware setup
app.use(cors(corsOptions)); // CORS configuration
app.use(helmet()); // Security headers
app.use(express.json()); // JSON body parsing
app.use(timeoutMiddleware);
app.use(errorHandlingMiddleware);

// Route handling
handleRoutes(app);

// Start server
const server = app.listen(config.server.port, () => {
  console.log(
    `[server]: Server is running at http://localhost:${config.server.port}`
  );
});

// Graceful shutdown
setupGracefulShutdown(server);
