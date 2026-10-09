import cors from "cors";
import express, { Express } from "express";
import { config } from "./config";
import { authRouter } from "./routes/auth";
import { contactsRouter } from "./routes/contacts";
import { dealsRouter } from "./routes/deals";

export function createApp(): Express {
  const app = express();
  app.use(express.json());

  if (config.corsOrigin) {
    app.use(cors({ origin: config.corsOrigin.split(","), credentials: true }));
  }

  app.get("/health", (_req, res) => res.json({ status: "ok", service: "pursuit-backend" }));

  app.use("/auth", authRouter);
  app.use("/api/contacts", contactsRouter);
  app.use("/api/deals", dealsRouter);

  return app;
}
