import { Request, Response } from "express";
import { generateToken, verifyToken } from "./utils/jwtUtils";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("CAD server is running");
});

app.post("/api/token", (req: Request, res: Response) => {
  const userId = req.body.userId;
  const token = generateToken({ userId });
  res.json({ token });
});

app.get("/protected", (req: Request, res: Response) => {
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

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
