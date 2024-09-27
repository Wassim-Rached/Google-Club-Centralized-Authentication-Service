import cors from "cors";
import config from "./config";

export const corsOptions: cors.CorsOptions = {
  origin: config.cors.allowedOrigins,
  methods: config.cors.allowedMethods,
  allowedHeaders: config.cors.allowedHeaders,
  credentials: config.cors.allowCredentials,
  maxAge: config.cors.maxAge,
  optionsSuccessStatus: 200,
};
