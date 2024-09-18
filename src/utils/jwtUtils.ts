import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import config from "../config";

const privateKey = config.jwt.privateKey;
const publicKey = config.jwt.publicKey;

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
