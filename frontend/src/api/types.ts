export type DealStage = "DISCOVERY" | "PROPOSAL" | "NEGOTIATION" | "CLOSED_WON" | "CLOSED_LOST";

export const STAGES: DealStage[] = ["DISCOVERY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON", "CLOSED_LOST"];

export const STAGE_LABELS: Record<DealStage, string> = {
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed won",
  CLOSED_LOST: "Closed lost",
};

export interface User {
  id: number;
  email: string;
  displayName: string;
}

export interface Contact {
  id: number;
  company: string;
  person: string;
  title: string | null;
  region: string | null;
  createdAt: string;
}

export interface Deal {
  id: number;
  contactId: number;
  contact: Contact;
  valueCents: number;
  stage: DealStage;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineSummary {
  openPipelineCents: number;
  weightedForecastCents: number;
  openDealCount: number;
  winRate: number;
  avgDealCents: number;
}
