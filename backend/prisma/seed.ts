/**
 * Demo data for a fresh database — so the live app shows a populated, working pipeline
 * instead of an empty shell. Company names are real Vietnamese companies pulled from
 * Wikidata's public SPARQL endpoint (CC0-licensed, open for exactly this kind of use);
 * contacts, deal values, stages and notes are invented for the demo.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@pursuit.app";
const DEMO_PASSWORD = "DemoPursuit2026!";

const CONTACTS = [
  { company: "Momo (M_Service)", person: "Linh Tran", title: "Head of Partnerships", region: "Ho Chi Minh City" },
  { company: "Zalo", person: "Duc Nguyen", title: "VP Engineering", region: "Ho Chi Minh City" },
  { company: "MobiFone", person: "Hoa Pham", title: "Director of Procurement", region: "Hanoi" },
  { company: "Vinaphone", person: "Minh Le", title: "IT Director", region: "Hanoi" },
  { company: "Vietnam Posts and Telecommunications Group", person: "Trang Vo", title: "CTO", region: "Hanoi" },
  { company: "Adamo Software", person: "Khoa Dang", title: "COO", region: "Da Nang" },
  { company: "Luvina Software Joint Stock Company", person: "Huy Bui", title: "CEO", region: "Hanoi" },
  { company: "Mageplaza", person: "An Pham", title: "Product Lead", region: "Ho Chi Minh City" },
  { company: "bTaskee", person: "Mai Hoang", title: "Operations Director", region: "Ho Chi Minh City" },
  { company: "FPT Digital Retail", person: "Son Tran", title: "Head of Digital", region: "Hanoi" },
  { company: "SotaMedia", person: "Quynh Do", title: "Marketing Director", region: "Ho Chi Minh City" },
  { company: "Pharmacity", person: "Nhat Vu", title: "IT Director", region: "Ho Chi Minh City" },
  { company: "An Binh Bank", person: "Tuan Phan", title: "Head of Digital Banking", region: "Hanoi" },
  { company: "Co.opmart", person: "Thao Nguyen", title: "Supply Chain Director", region: "Ho Chi Minh City" },
  { company: "F88", person: "Bao Ngo", title: "CTO", region: "Ho Chi Minh City" },
] as const;

const DEALS: Array<{ company: string; valueCents: number; stage: "DISCOVERY" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST"; note: string }> = [
  { company: "Momo (M_Service)", valueCents: 5_800_000, stage: "DISCOVERY", note: "Next call Thursday" },
  { company: "Zalo", valueCents: 12_400_000, stage: "PROPOSAL", note: "Proposal sent 3 days ago" },
  { company: "MobiFone", valueCents: 9_850_000, stage: "NEGOTIATION", note: "Redline on SLA terms" },
  { company: "Vinaphone", valueCents: 3_150_000, stage: "DISCOVERY", note: "Scoping doc due" },
  { company: "Vietnam Posts and Telecommunications Group", valueCents: 18_700_000, stage: "NEGOTIATION", note: "Budget sign-off pending" },
  { company: "Adamo Software", valueCents: 6_200_000, stage: "PROPOSAL", note: "Awaiting technical review" },
  { company: "Luvina Software Joint Stock Company", valueCents: 8_700_000, stage: "CLOSED_WON", note: "Kickoff scheduled" },
  { company: "Mageplaza", valueCents: 4_130_000, stage: "CLOSED_WON", note: "Onboarding in progress" },
  { company: "bTaskee", valueCents: 2_900_000, stage: "CLOSED_LOST", note: "Went with an in-house build" },
  { company: "FPT Digital Retail", valueCents: 7_620_000, stage: "PROPOSAL", note: "Second meeting booked" },
  { company: "SotaMedia", valueCents: 5_290_000, stage: "NEGOTIATION", note: "Verbal yes, contract out" },
  { company: "Pharmacity", valueCents: 4_410_000, stage: "DISCOVERY", note: "Intro call next week" },
];

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
  if (existing) {
    console.log("Demo user already exists, skipping seed.");
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.create({
    data: { email: DEMO_EMAIL, passwordHash, displayName: "Demo Account" },
  });

  const contactByCompany = new Map<string, number>();
  for (const c of CONTACTS) {
    const contact = await prisma.contact.create({ data: { ...c, userId: user.id } });
    contactByCompany.set(c.company, contact.id);
  }

  for (const d of DEALS) {
    const contactId = contactByCompany.get(d.company);
    if (!contactId) continue;
    await prisma.deal.create({
      data: { userId: user.id, contactId, valueCents: d.valueCents, stage: d.stage, note: d.note },
    });
  }

  console.log(`Seeded demo account: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
