import { generateToken, verifyToken } from "./utils/jwtUtils";
import { getUserInfoByEmail } from "./helpers/dbQueries";
import bcrypt from "bcrypt";
import { Express, Request, Response } from "express";

export function handleRoutes(app: Express) {
  app.get("/", (req: Request, res: Response) => {
    res.send("CAD server is running");
  });

  app.post("/api/token", async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userInfo = await getUserInfoByEmail(email);

    if (!userInfo) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!bcrypt.compareSync(password, userInfo.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken({ userId: userInfo.id, email });

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
}
