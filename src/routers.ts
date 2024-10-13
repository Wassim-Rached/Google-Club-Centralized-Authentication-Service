import { generateToken, verifyToken } from "./utils/jwtUtils";
import {
  getAccountInfoByEmail,
  getAccountAuthoritiesById,
} from "./helpers/dbQueries";
import bcrypt from "bcrypt";
import { Express, Request, Response } from "express";
import {
  clearAllAuthoritiesCache,
  clearAuthoritiesCacheForAccount,
  getAuthoritiesCacheForAccount,
  appendAuthoritiesCacheForAccount,
} from "./utils/authoritiesCache";
import { requireJwt } from "./middlewares";
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

    const userInfo = await getAccountInfoByEmail(email);

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

  app.get("/api/token/authorities", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(" ")[1];

      if (!token) {
        return res.status(401).json({ message: "Token missing" });
      }

      // Verify and decode JWT
      const decoded = verifyToken(token);
      const accountId: string = decoded.sub as string;

      // Fetch user authorities
      // get from request params
      const scope = req.query.scope as string;

      let authorities = getAuthoritiesCacheForAccount(accountId, scope);
      if (!authorities) {
        authorities = await getAccountAuthoritiesById(accountId, scope);
        appendAuthoritiesCacheForAccount(accountId, authorities);
      }

      res.json({ authorities });
    } catch (error) {
      console.error("Error processing JWT:", error);
      res.status(403).json({ message: "Invalid or expired token" });
    }
  });

  app.post(
    "/api/token/authorities/clear-cache",
    requireJwt,
    async (req: Request, res: Response) => {
      const currentAccountId = res.locals.decodedJwt.sub;

      const currentAccountAuthorities = await getAccountAuthoritiesById(
        currentAccountId,
        "cas"
      );
      if (
        !currentAccountAuthorities.includes(AUTHORITIES["clear_account_cache"])
      ) {
        res.status(403).json({ message: "Insuffisent Permissions" });
        return;
      }

      const { accountId } = req.params;
      clearAuthoritiesCacheForAccount(accountId);

      res.json({ message: "Account Authorities Cache cleared" });
    }
  );

  app.post(
    "/api/token/authorities/clear-cache/all",
    requireJwt,
    async (req: Request, res: Response) => {
      const currentAccountId = res.locals.decodedJwt.sub;

      const currentAccountAuthorities = await getAccountAuthoritiesById(
        currentAccountId,
        "cas"
      );
      if (
        !currentAccountAuthorities.includes(
          AUTHORITIES["clear_all_accounts_cache"]
        )
      ) {
        res.status(403).json({ message: "Insuffisent Permissions" });
        return;
      }

      clearAllAuthoritiesCache();

      res.json({ message: "All Accounts Authorities Cache cleared" });
    }
  );
}
