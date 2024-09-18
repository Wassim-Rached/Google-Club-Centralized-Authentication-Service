import cors from "cors";
import config from "./config";

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || config.cors.allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error("Not allowed by CORS")); // Origin not allowed
    }
  },
  methods: config.cors.allowedMethods,
  allowedHeaders: config.cors.allowedHeaders,
  credentials: config.cors.allowCredentials,
  maxAge: config.cors.maxAge,
  optionsSuccessStatus: 200,
};
