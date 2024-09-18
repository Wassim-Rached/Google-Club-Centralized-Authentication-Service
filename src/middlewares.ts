// middleware.ts
import { Request, Response, NextFunction } from "express";
import config from "./config";

// Timeout middleware
export const timeoutMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setTimeout(config.timeout.requestTimeout, () => {
    return res.status(503).json({ message: "Request timeout" });
  });
  next();
};

// Error handling middleware
export const errorHandlingMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
};
