import bcrypt from "bcrypt";
import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signToken } from "../lib/tokens";
import { requireAuth } from "../middleware/auth";

export const authRouter = Router();

const SALT_ROUNDS = 12;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password must be at least 8 characters"),
  displayName: z.string().min(1).max(100),
});

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "invalid input" });
    return;
  }
  const { email, password, displayName } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(409).json({ error: "an account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, passwordHash, displayName } });

  const token = signToken({ userId: user.id });
  res.status(201).json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same generic error whether the email doesn't exist or the password is wrong — doesn't
  // leak which accounts exist.
  const invalid = () => res.status(401).json({ error: "invalid email or password" });
  if (!user) {
    invalid();
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    invalid();
    return;
  }

  const token = signToken({ userId: user.id });
  res.json({ token, user: { id: user.id, email: user.email, displayName: user.displayName } });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: "account no longer exists" });
    return;
  }
  res.json({ id: user.id, email: user.email, displayName: user.displayName });
});
