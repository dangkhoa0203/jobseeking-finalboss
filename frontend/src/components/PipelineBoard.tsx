import type { Deal, DealStage } from "../api/types";
import { STAGES, STAGE_LABELS } from "../api/types";
import { DealCard } from "./DealCard";
import styles from "./PipelineBoard.module.scss";

interface Props {
  deals: Deal[];
  onStageChange(id: number, stage: DealStage): void;
  onDelete(id: number): void;
}

export function PipelineBoard({ deals, onStageChange, onDelete }: Props) {
  const byStage: Record<DealStage, Deal[]> = {
    DISCOVERY: [],
    PROPOSAL: [],
    NEGOTIATION: [],
    CLOSED_WON: [],
    CLOSED_LOST: [],
  };
  for (const deal of deals) byStage[deal.stage].push(deal);

  return (
    <div className={styles.board}>
      {STAGES.map((stage) => (
        <div className={styles.column} key={stage}>
          <div className={styles.colHead}>
            <span>{STAGE_LABELS[stage]}</span>
            <span className={styles.count}>{byStage[stage].length}</span>
          </div>
          {byStage[stage].length === 0 && <p className={styles.empty}>No deals</p>}
          {byStage[stage].map((deal) => (
            <DealCard key={deal.id} deal={deal} onStageChange={onStageChange} onDelete={onDelete} />
          ))}
        </div>
      ))}
    </div>
  );
}
