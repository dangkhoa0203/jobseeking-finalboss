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
  {
    company: "Momo (M_Service)",
    valueCents: 42_000_000,
    stage: "DISCOVERY",
    note: "Digital wallet platform modernization — replacing their legacy transaction ledger with an event-driven architecture ahead of a planned IPO filing. Had an exploratory call with the Head of Partnerships; she's bringing in their CTO for a technical deep-dive next Thursday. Scope still loose — could land anywhere from a 6-month advisory engagement to a full 18-month build.",
  },
  {
    company: "Zalo",
    valueCents: 18_500_000,
    stage: "PROPOSAL",
    note: "Enterprise notification and chat-API integration for their business messaging product. Sent a detailed proposal 3 days ago covering a phased rollout (pilot with 2 merchant partners, then general availability). No response yet — following up Monday if we haven't heard back. Their VP Engineering seemed genuinely enthusiastic in the first call, which is a good sign.",
  },
  {
    company: "MobiFone",
    valueCents: 65_000_000,
    stage: "NEGOTIATION",
    note: "Largest deal in the pipeline right now — a full OSS/BSS integration tying their billing, provisioning, and customer-care systems together across three regional data centers. We're down to one sticking point: their legal team wants a 99.95% uptime SLA with financial penalties attached, and our standard terms cap liability lower than that. Escalating to leadership this week to see how much room we actually have.",
  },
  {
    company: "Vinaphone",
    valueCents: 9_500_000,
    stage: "DISCOVERY",
    note: "Customer self-service portal rebuild — their current one is a decade-old PHP app nobody wants to touch. IT Director asked for a scoping document before committing to anything, due back to them by end of week. Smaller deal but could be a good foot-in-the-door for the rest of the VNPT group.",
  },
  {
    company: "Vietnam Posts and Telecommunications Group",
    valueCents: 120_000_000,
    stage: "NEGOTIATION",
    note: "National-scale broadband rollout analytics platform — real-time network health dashboards across every province, feeding into their 5-year infrastructure investment planning. This is a multi-year framework agreement, not a single project, which is why it's taking so long. Budget sign-off is sitting with their board; our champion (the CTO) says it's \"very likely\" to clear next quarter but nothing's final until it's final.",
  },
  {
    company: "Adamo Software",
    valueCents: 14_000_000,
    stage: "PROPOSAL",
    note: "Staff augmentation engagement — they need a dedicated 4-person squad for 9 months to help ship a client project they're overcommitted on. Proposal is with their technical reviewer now; he flagged a couple of rate-card questions we've already answered over email, just waiting on the formal go-ahead.",
  },
  {
    company: "Luvina Software Joint Stock Company",
    valueCents: 21_000_000,
    stage: "CLOSED_WON",
    note: "Signed — a 12-month offshore QA and test-automation engagement covering three of their ongoing client projects. Kickoff call scheduled for next Monday with their CEO and delivery leads. This one moved fast: first conversation to signature in under three weeks, mostly because we already had a working relationship from a smaller project last year.",
  },
  {
    company: "Mageplaza",
    valueCents: 7_800_000,
    stage: "CLOSED_WON",
    note: "Built out a multi-store Magento extension suite for their enterprise clients — custom checkout flows, inventory sync, and a loyalty-points module. Delivered on time, currently in the onboarding phase getting their support team trained on the codebase before we hand off full ownership.",
  },
  {
    company: "bTaskee",
    valueCents: 6_500_000,
    stage: "CLOSED_LOST",
    note: "Lost this one — they decided to build the logistics routing optimization in-house after their new VP of Engineering joined and pushed for more control over core infrastructure. Worth staying in touch; their current team is small and they may come back to us for the pieces that aren't core to their business.",
  },
  {
    company: "FPT Digital Retail",
    valueCents: 34_000_000,
    stage: "PROPOSAL",
    note: "Omnichannel inventory sync platform — unifying stock visibility across their online store and 40+ physical locations in real time. Had a strong first meeting; second one is booked for next week with their ops team to walk through the current manual reconciliation process we'd be replacing. Head of Digital is the internal champion pushing this forward.",
  },
  {
    company: "SotaMedia",
    valueCents: 15_500_000,
    stage: "NEGOTIATION",
    note: "Marketing automation platform build — campaign orchestration, audience segmentation, and attribution reporting in one tool, replacing the patchwork of spreadsheets and third-party tools they're currently stitching together. Verbal yes from their Marketing Director; contract is with legal for final review. Expecting signature within two weeks barring surprises.",
  },
  {
    company: "Pharmacity",
    valueCents: 29_000_000,
    stage: "DISCOVERY",
    note: "Prescription management system with pharmacist-facing dispensing workflows and patient history tracking — a regulated-data project, so compliance requirements will shape the scope significantly. Intro call booked for next week with their IT Director; bringing a healthcare-data specialist from our side to make sure we ask the right questions upfront.",
  },
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
