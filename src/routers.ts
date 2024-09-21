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
  setAuthoritiesCacheForAccount,
} from "./utils/authoritiesCache";
import { requireJwt } from "./middlewares";

export function handleRoutes(app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.send("Central Authentication Service is up and running");
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

      let authorities = getAuthoritiesCacheForAccount(accountId);
      if (!authorities) {
        authorities = await getAccountAuthoritiesById(accountId, scope);
        setAuthoritiesCacheForAccount(accountId, authorities);
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
      if (!currentAccountAuthorities.includes("cas.perm.clear_account_cache")) {
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
        !currentAccountAuthorities.includes("cas.perm.clear_all_accounts_cache")
      ) {
        res.status(403).json({ message: "Insuffisent Permissions" });
        return;
      }

      clearAllAuthoritiesCache();

      res.json({ message: "All Accounts Authorities Cache cleared" });
    }
  );
}
