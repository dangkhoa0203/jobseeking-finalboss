import type { PipelineSummary } from "../api/types";
import { formatMoney, formatPercent } from "../utils/format";
import styles from "./StatsRow.module.scss";

export function StatsRow({ summary }: { summary: PipelineSummary }) {
  const stats = [
    { label: "Open pipeline", value: formatMoney(summary.openPipelineCents) },
    { label: "Weighted forecast", value: formatMoney(summary.weightedForecastCents) },
    { label: "Win rate", value: formatPercent(summary.winRate) },
    { label: "Avg. deal size", value: formatMoney(summary.avgDealCents) },
  ];

  return (
    <div className={styles.row}>
      {stats.map((s) => (
        <div className={styles.stat} key={s.label}>
          <div className={styles.label}>{s.label}</div>
          <div className={styles.value}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}
