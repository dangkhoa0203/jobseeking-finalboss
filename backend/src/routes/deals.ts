import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const dealsRouter = Router();
dealsRouter.use(requireAuth);

const STAGES = ["DISCOVERY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"] as const;

const dealSchema = z.object({
  contactId: z.number().int().positive(),
  valueCents: z.number().int().nonnegative(),
  stage: z.enum(STAGES).optional(),
  note: z.string().max(2000).optional(),
});

dealsRouter.get("", async (req, res) => {
  const deals = await prisma.deal.findMany({
    where: { userId: req.userId },
    include: { contact: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(deals);
});

// Pipeline summary — open value, weighted forecast, win rate, average deal size. Computed
// server-side so the dashboard's stat row is one request, not a client-side reduce over
// every deal.
dealsRouter.get("/summary", async (req, res) => {
  const deals = await prisma.deal.findMany({ where: { userId: req.userId } });

  const open = deals.filter((d) => d.stage !== "CLOSED_WON" && d.stage !== "CLOSED_LOST");
  const closed = deals.filter((d) => d.stage === "CLOSED_WON" || d.stage === "CLOSED_LOST");
  const won = deals.filter((d) => d.stage === "CLOSED_WON");

  const stageWeight: Record<string, number> = {
    DISCOVERY: 0.1,
    PROPOSAL: 0.35,
    NEGOTIATION: 0.65,
    CLOSED_WON: 1,
    CLOSED_LOST: 0,
  };

  const openPipelineCents = open.reduce((sum, d) => sum + d.valueCents, 0);
  const weightedForecastCents = open.reduce((sum, d) => sum + d.valueCents * stageWeight[d.stage], 0);
  const winRate = closed.length > 0 ? won.length / closed.length : 0;
  const avgDealCents = open.length > 0 ? Math.round(openPipelineCents / open.length) : 0;

  res.json({
    openPipelineCents,
    weightedForecastCents: Math.round(weightedForecastCents),
    openDealCount: open.length,
    winRate,
    avgDealCents,
  });
});

dealsRouter.post("", async (req, res) => {
  const parsed = dealSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "invalid input" });
    return;
  }

  const contact = await prisma.contact.findFirst({
    where: { id: parsed.data.contactId, userId: req.userId },
  });
  if (!contact) {
    res.status(400).json({ error: "contact not found" });
    return;
  }

  const deal = await prisma.deal.create({
    data: { ...parsed.data, userId: req.userId! },
    include: { contact: true },
  });
  res.status(201).json(deal);
});

dealsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.deal.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    res.status(404).json({ error: "not found" });
    return;
  }

  const parsed = dealSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "invalid input" });
    return;
  }
  const deal = await prisma.deal.update({ where: { id }, data: parsed.data, include: { contact: true } });
  res.json(deal);
});

dealsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.deal.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    res.status(404).json({ error: "not found" });
    return;
  }
  await prisma.deal.delete({ where: { id } });
  res.status(204).send();
});
