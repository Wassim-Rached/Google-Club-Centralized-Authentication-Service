// middleware.ts
import { Request, Response, NextFunction } from "express";
import config from "./config";
import { verifyToken } from "./utils/jwtUtils";
import { queryAccountAuthoritiesById } from "./helpers/dbQueries";
import {
  getAccountAuthorities,
  getAccountAuthoritiesForScope,
} from "./authorities";
import { JwtPayload } from "jsonwebtoken";

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

// Extract JWT from Authorization header
export const extractJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from the Authorization header (Bearer <token>)
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return next();
    }

    // Verify and decode JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Attach decoded token to the request object
    res.locals.jwt = token;
    res.locals.decodedJwt = decoded;
    res.locals.isAuthenticated = true;
    res.locals.accountId = decoded.sub;
    next();
  } catch (error) {
    console.error("Error in JWT verification:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Middleware to require JWT
export const requireJwt = (req: Request, res: Response, next: NextFunction) => {
  if (!res.locals.decodedJwt) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export const extractAuthorities =
  (forceDbQuery: boolean = false) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = res.locals.jwt;
      if (!token) {
        res.locals.authorities = [];
        return next();
      }
      const accountId: string = res.locals.decodedJwt.sub as string;
      res.locals.authorities = await getAccountAuthoritiesForScope(
        accountId,
        "cas",
        forceDbQuery
      );

      next();
    } catch (error) {
      console.error("Error in authorities extraction:", error);
      return res.status(500).json({ message: "Server error" });
    }
  };

export function requireAuthority(authority: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authorities = res.locals.authorities;
    if (!authorities.includes(authority)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
}
