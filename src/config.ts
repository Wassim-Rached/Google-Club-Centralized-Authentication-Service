import { reformatPemKey } from "./utils/keys";
import dotenv from "dotenv";

dotenv.config();

export default {
  db: {
    user: process.env.DB_USER || "postgres",
    host: process.env.DB_HOST || "localhost",
    database: process.env.DB_NAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    port: process.env.DB_PORT || 5432,
  },
  jwt: {
    privateKey: process.env.PRIVATE_KEY
      ? reformatPemKey(process.env.PRIVATE_KEY, false)
      : "",
    publicKey: process.env.PUBLIC_KEY
      ? reformatPemKey(process.env.PUBLIC_KEY || "", true)
      : "",
    expiration: process.env.JWT_EXPIRATION || "1h",
  },
  server: {
    port: process.env.PORT || 3000,
  },
  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS?.split(",") || [],
    allowedMethods: process.env.CORS_ALLOWED_METHODS?.split(",") || [
      "GET",
      "POST",
    ],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(",") || [
      "Authorization",
      "Content-Type",
    ],
    allowCredentials: process.env.CORS_ALLOW_CREDENTIALS === "true" || false,
    maxAge: parseInt(process.env.CORS_MAX_AGE || "86400", 10), // Default 24 hours
  },
  timeout: {
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || "10000", 10), // Default 10s
  },
};
