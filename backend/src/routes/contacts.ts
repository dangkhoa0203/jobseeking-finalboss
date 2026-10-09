import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const contactsRouter = Router();
contactsRouter.use(requireAuth);

const contactSchema = z.object({
  company: z.string().min(1).max(150),
  person: z.string().min(1).max(150),
  title: z.string().max(150).optional(),
  region: z.string().max(100).optional(),
});

contactsRouter.get("", async (req, res) => {
  const contacts = await prisma.contact.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(contacts);
});

contactsRouter.post("", async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "invalid input" });
    return;
  }
  const contact = await prisma.contact.create({ data: { ...parsed.data, userId: req.userId! } });
  res.status(201).json(contact);
});

contactsRouter.patch("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.contact.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    res.status(404).json({ error: "not found" });
    return;
  }

  const parsed = contactSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message || "invalid input" });
    return;
  }
  const contact = await prisma.contact.update({ where: { id }, data: parsed.data });
  res.json(contact);
});

contactsRouter.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const existing = await prisma.contact.findFirst({ where: { id, userId: req.userId } });
  if (!existing) {
    res.status(404).json({ error: "not found" });
    return;
  }
  await prisma.contact.delete({ where: { id } });
  res.status(204).send();
});
