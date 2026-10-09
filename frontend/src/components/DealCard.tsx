import type { Deal, DealStage } from "../api/types";
import { STAGES, STAGE_LABELS } from "../api/types";
import { formatMoney } from "../utils/format";
import styles from "./DealCard.module.scss";

interface Props {
  deal: Deal;
  onStageChange(id: number, stage: DealStage): void;
  onDelete(id: number): void;
}

export function DealCard({ deal, onStageChange, onDelete }: Props) {
  const cardClass = [
    styles.card,
    deal.stage === "CLOSED_WON" ? styles.won : "",
    deal.stage === "CLOSED_LOST" ? styles.lost : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass}>
      <div className={styles.company}>{deal.contact.company}</div>
      <div className={styles.contact}>
        {deal.contact.person}
        {deal.contact.title ? ` · ${deal.contact.title}` : ""}
      </div>
      <div className={styles.meta}>
        <span className={`${styles.value} ${deal.stage === "CLOSED_WON" ? styles.won : ""}`}>
          {formatMoney(deal.valueCents)}
        </span>
      </div>
      {deal.note && <div className={styles.note}>{deal.note}</div>}
      <div className={styles.actions}>
        <select
          className={styles.stageSelect}
          value={deal.stage}
          onChange={(e) => onStageChange(deal.id, e.target.value as DealStage)}
          aria-label={`Stage for ${deal.contact.company}`}
        >
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {STAGE_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => onDelete(deal.id)}
          aria-label={`Delete deal with ${deal.contact.company}`}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
