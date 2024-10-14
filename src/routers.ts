import { generateToken, verifyToken } from "./utils/jwtUtils";
import { queryAccountInfoByEmail } from "./helpers/dbQueries";
import bcrypt from "bcrypt";
import { Express, Request, Response } from "express";
import {
  clearAllAccountsAuthoritiesCache,
  clearAuthoritiesCacheForAccount,
  getAllAuthoritiesCacheKeys,
} from "./utils/authoritiesCache";
import {
  extractAuthorities,
  extractJwt,
  requireAuthority,
  requireJwt,
} from "./middlewares";
import { HealthCheckResponse } from "./types";
import configuration from "./config";
import { AUTHORITIES } from "./authorities";

export function handleRoutes(app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.send("Central Authentication Service is up and running");
  });

  app.get("/api/health", async (req: Request, res: Response) => {
    // check if dep servers are all healthy
    const depServers = configuration.server.depServers;

    const result: HealthCheckResponse = {
      status: "healthy",
      dependencies: {},
    };

    for (const depServer of depServers) {
      try {
        const response = await fetch(`${depServer}/api/health`);
        const data = await response.json();

        if (response.status === 200) {
          result.dependencies[depServer] = {
            status: "healthy",
            code: response.status,
          };
        } else {
          result.status = "unhealthy";
          result.dependencies[depServer] = {
            status: "unhealthy",
            code: response.status,
            body: data,
          };
        }
      } catch (error: any) {
        result.status = "unhealthy";
        result.dependencies[depServer] = {
          status: "unhealthy",
          code: 500,
          error: error.message,
        };
      }
    }

    const statusCode = result.status === "healthy" ? 200 : 500;

    return res.status(statusCode).json(result);
  });

  app.post("/api/token", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userInfo = await queryAccountInfoByEmail(email);

    if (!userInfo) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!bcrypt.compareSync(password, userInfo.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ email: email, sub: userInfo.id });

    res.json({ token });
  });

  app.get("/api/token/verify", (req: Request, res: Response) => {
    const token = req.headers.authorization?.split(" ")[1]; // Bearer token

    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    try {
      const decoded = verifyToken(token);

      res.json({ message: "Access granted", data: decoded });
    } catch (err) {
      res.status(401).json({ message: "Invalid token" });
    }
  });

  app.get(
    "/api/token/authorities",
    extractJwt,
    requireJwt,
    extractAuthorities(false),
    async (req: Request, res: Response) => {
      res.json({ authorities: res.locals.authorities });
    }
  );

  app.get(
    "/api/token/authorities/cache",
    extractJwt,
    requireJwt,
    extractAuthorities(true),
    requireAuthority(AUTHORITIES["view_account_cache"]),
    async (req, res) => {
      const { accountId } = req.query;

      if (!accountId) {
        return res.status(400).json({ message: "Account ID is required" });
      }

      const authoritiesAccountsIds = getAllAuthoritiesCacheKeys();
      return res.json({
        authoritiesAccountsIds,
      });
    }
  );

  app.delete(
    "/api/token/authorities/cache/:accountId",
    extractJwt,
    requireJwt,
    extractAuthorities(true),
    requireAuthority(AUTHORITIES["clear_account_cache"]),
    async (req: Request, res: Response) => {
      const { accountId } = req.params;
      clearAuthoritiesCacheForAccount(accountId);

      res.json({ message: "Account Authorities Cache cleared" });
    }
  );

  app.post(
    "/api/token/authorities/cache/clear-all",
    extractJwt,
    requireJwt,
    extractAuthorities(true),
    requireAuthority(AUTHORITIES["clear_all_accounts_cache"]),
    async (req: Request, res: Response) => {
      clearAllAccountsAuthoritiesCache();

      res.json({ message: "All Accounts Authorities Cache cleared" });
    }
  );
}
