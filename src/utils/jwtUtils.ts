import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import * as dotenv from "dotenv";

dotenv.config();

// Load RSA keys from environment variables, replacing the escaped \n characters with actual newlines
const privateKey = process.env.PRIVATE_KEY?.replace(/\\n/g, "\n") || "";
const publicKey = process.env.PUBLIC_KEY?.replace(/\\n/g, "\n") || "";

export function generateToken(payload: object): string {
  const options: SignOptions = {
    algorithm: "RS256",
    expiresIn: process.env.JWT_EXPIRATION || "1h",
  };

  return jwt.sign(payload, privateKey, options);
}

export function verifyToken(token: string): JwtPayload | string {
  try {
    return jwt.verify(token, publicKey, { algorithms: ["RS256"] });
  } catch (err) {
    throw new Error("Invalid token");
  }
}
