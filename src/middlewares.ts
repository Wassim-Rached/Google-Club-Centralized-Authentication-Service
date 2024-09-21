// middleware.ts
import { Request, Response, NextFunction } from "express";
import config from "./config";
import { verifyToken } from "./utils/jwtUtils";
import { getAuthoritiesCacheForAccount } from "./utils/authoritiesCache";

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

export const requireJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from the Authorization header (Bearer <token>)
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Token missing" });
    }

    // Verify and decode JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach decoded token to the request object
    res.locals.decodedJwt = decoded;
    next();
  } catch (error) {
    console.error("Error in JWT verification:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
