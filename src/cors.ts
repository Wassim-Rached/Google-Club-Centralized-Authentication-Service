import cors from "cors";
import config from "./config";
import { Request, Response, NextFunction } from "express";

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || config.cors.allowedOrigins.includes(origin)) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error(`Origin "${origin}" is not allowed by CORS.`));
    }
  },
  methods: config.cors.allowedMethods,
  allowedHeaders: config.cors.allowedHeaders,
  credentials: config.cors.allowCredentials,
  maxAge: config.cors.maxAge,
  preflightContinue: true,
  optionsSuccessStatus: 200,
};

const corsMiddleware = cors(corsOptions);

const customCorsErrorHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  corsMiddleware(req, res, (err) => {
    if (err) {
      next(err);
    } else if (res.statusCode === 403) {
      res.status(403).json({
        error: "Access denied due to CORS restrictions.",
        message: `The origin "${req.headers.origin}" is not allowed by CORS. Please check your request headers and origin.`,
      });
    } else {
      next();
    }
  });
};

export { customCorsErrorHandler };
