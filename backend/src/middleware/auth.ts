import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../lib/tokens";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    res.status(401).json({ error: "authentication required" });
    return;
  }

  const payload = verifyToken(header.slice("Bearer ".length));
  if (!payload) {
    res.status(401).json({ error: "invalid or expired token" });
    return;
  }

  req.userId = payload.userId;
  next();
}
